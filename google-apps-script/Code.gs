const CONFIG = {
  employeeSheet: 'MASTER LIST OF PERSONNEL',
  equipmentSheets: [
    'PPE ACCOUNTABILITY',
    'SEMI-EXPENDABLE PROPERTY (SE)',
    'TECHNICAL AND SCIENTIFIC EQUIPMENTS',
    'OFFICE EQUIPMENTS - EXPANDABLES',
    'SUPPLIES AND SEMI-EXPENDABLES/OFFICE EQUIPMENT',
  ],
};

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function doPut(e) {
  return handleRequest(e);
}

function doDelete(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const params = e.parameter || {};
    const body = parseBody(e);
    const action = body.action || params.action;

    switch (action) {
      case 'getEmployees':
        return jsonResponse(true, 'Employees loaded successfully', getEmployees());
      case 'getEquipments':
        return jsonResponse(true, 'Equipments loaded successfully', getEquipments());
      case 'getEquipmentByEmployee':
        return jsonResponse(true, 'Employee equipments loaded successfully', getEquipmentByEmployee(body.employeeName || params.employeeName));
      case 'createEquipment':
        return jsonResponse(true, 'Equipment created successfully', createEquipment(body.equipment));
      case 'updateEquipment':
        return jsonResponse(true, 'Equipment updated successfully', updateEquipment(body.equipment));
      case 'deleteEquipment':
        return jsonResponse(true, 'Equipment deleted successfully', deleteEquipment(body.id));
      default:
        return jsonResponse(false, 'Unknown API action', null);
    }
  } catch (error) {
    return jsonResponse(false, error.message || 'Request failed', null);
  }
}

function getEmployees() {
  const sheet = getSheet(CONFIG.employeeSheet);
  return readRows(sheet).map((row) => ({
    employeeId: row['Employee ID'] || '',
    name: row.Name || '',
    status: row.STATUS || '',
    position: row.Position || '',
  }));
}

function getEquipments() {
  return CONFIG.equipmentSheets.flatMap((sheetName) => {
    const sheet = getSheet(sheetName);
    return readRows(sheet).map((row, index) => normalizeEquipment(row, sheetName, index + 2));
  });
}

function getEquipmentByEmployee(employeeName) {
  if (!employeeName) throw new Error('employeeName is required');
  return getEquipments().filter((item) => String(item.issuedTo).toLowerCase() === String(employeeName).toLowerCase());
}

function createEquipment(equipment) {
  validateEquipment(equipment);
  const sheet = getSheet(equipment.category);
  const headers = getHeaders(sheet);
  const accountabilityHeader = equipment.accountabilityType === 'ICS' ? 'ICS No.' : 'PAR No.';
  const row = headers.map((header) => {
    switch (header) {
      case 'Article':
        return equipment.article || '';
      case 'Property No.':
        return equipment.propertyNo || '';
      case 'Item Description':
        return equipment.itemDescription || '';
      case 'Amount':
        return equipment.amount || 0;
      case 'PAR No.':
      case 'ICS No.':
        return header === accountabilityHeader ? equipment.accountabilityNo || '' : '';
      case 'Issued To':
        return equipment.issuedTo || '';
      case 'Date Issued':
        return equipment.dateIssued || '';
      case 'Status':
        return equipment.status || '';
      case 'Location':
        return equipment.location || '';
      case 'Remarks':
        return equipment.remarks || '';
      default:
        return '';
    }
  });
  sheet.appendRow(row);
  return normalizeEquipment(rowObject(headers, row), equipment.category, sheet.getLastRow());
}

function updateEquipment(equipment) {
  validateEquipment(equipment);
  if (!equipment.id) throw new Error('Equipment id is required');
  const match = findEquipmentRow(equipment.id);
  if (!match) throw new Error('Equipment not found');
  const sheet = match.sheet;
  const headers = getHeaders(sheet);
  const current = rowObject(headers, sheet.getRange(match.rowIndex, 1, 1, headers.length).getValues()[0]);
  const merged = Object.assign({}, normalizeEquipment(current, match.sheetName, match.rowIndex), equipment);
  const accountabilityHeader = merged.accountabilityType === 'ICS' ? 'ICS No.' : 'PAR No.';
  const values = headers.map((header) => {
    switch (header) {
      case 'Article':
        return merged.article;
      case 'Property No.':
        return merged.propertyNo;
      case 'Item Description':
        return merged.itemDescription;
      case 'Amount':
        return merged.amount;
      case 'PAR No.':
      case 'ICS No.':
        return header === accountabilityHeader ? merged.accountabilityNo : '';
      case 'Issued To':
        return merged.issuedTo;
      case 'Date Issued':
        return merged.dateIssued;
      case 'Status':
        return merged.status;
      case 'Location':
        return merged.location;
      case 'Remarks':
        return merged.remarks;
      default:
        return current[header] || '';
    }
  });
  sheet.getRange(match.rowIndex, 1, 1, headers.length).setValues([values]);
  return normalizeEquipment(rowObject(headers, values), match.sheetName, match.rowIndex);
}

function deleteEquipment(id) {
  if (!id) throw new Error('Equipment id is required');
  const match = findEquipmentRow(id);
  if (!match) throw new Error('Equipment not found');
  match.sheet.deleteRow(match.rowIndex);
  return id;
}

function findEquipmentRow(id) {
  for (const sheetName of CONFIG.equipmentSheets) {
    const sheet = getSheet(sheetName);
    const headers = getHeaders(sheet);
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i += 1) {
      const equipment = normalizeEquipment(rowObject(headers, rows[i]), sheetName, i + 1);
      if (equipment.id === id) return { sheet, sheetName, rowIndex: i + 1 };
    }
  }
  return null;
}

function normalizeEquipment(row, category, rowIndex) {
  const par = row['PAR No.'] || '';
  const ics = row['ICS No.'] || '';
  return {
    id: `${category}::${rowIndex}::${row['Property No.'] || ''}`,
    category,
    article: row.Article || '',
    propertyNo: row['Property No.'] || '',
    itemDescription: row['Item Description'] || '',
    amount: Number(row.Amount || 0),
    accountabilityNo: par || ics,
    accountabilityType: ics ? 'ICS' : 'PAR',
    issuedTo: row['Issued To'] || '',
    dateIssued: stringifyDate(row['Date Issued']),
    status: row.Status || '',
    location: row.Location || '',
    remarks: row.Remarks || '',
    updatedAt: new Date().toISOString(),
  };
}

function validateEquipment(equipment) {
  if (!equipment) throw new Error('Equipment payload is required');
  if (!equipment.category || CONFIG.equipmentSheets.indexOf(equipment.category) === -1) throw new Error('Valid category is required');
  if (!equipment.propertyNo) throw new Error('Property No. is required');
  if (!equipment.itemDescription) throw new Error('Item Description is required');
}

function readRows(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter((row) => row.some(Boolean)).map((row) => rowObject(headers, row));
}

function rowObject(headers, row) {
  return headers.reduce((object, header, index) => {
    object[header] = row[index];
    return object;
  }, {});
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
}

function getSheet(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error(`Missing sheet tab: ${name}`);
  return sheet;
}

function parseBody(e) {
  if (!e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    return {};
  }
}

function stringifyDate(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value);
}

function jsonResponse(success, message, data) {
  return ContentService.createTextOutput(JSON.stringify({ success, message, data })).setMimeType(ContentService.MimeType.JSON);
}
