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
  const params = e && e.parameter ? e.parameter : {};
  const callback = params.callback;

  try {
    const body = parseBody(e);
    const payload = Object.assign({}, body, parseParams(params));
    const action = payload.action || params.action;

    switch (action) {
      case 'getEmployees':
        return jsonResponse(true, 'Employees loaded successfully', getEmployees(), callback);
      case 'createEmployee':
        return jsonResponse(true, 'Employee created successfully', createEmployee(payload.employee), callback);
      case 'updateEmployee':
        return jsonResponse(true, 'Employee updated successfully', updateEmployee(payload.employee, payload.previousEmployee), callback);
      case 'deleteEmployee':
        return jsonResponse(true, 'Employee deleted successfully', deleteEmployee(payload.employee), callback);
      case 'getEquipments':
        return jsonResponse(true, 'Equipments loaded successfully', getEquipments(), callback);
      case 'getEquipmentByEmployee':
        return jsonResponse(true, 'Employee equipments loaded successfully', getEquipmentByEmployee(payload.employeeName || params.employeeName), callback);
      case 'createEquipment':
        return jsonResponse(true, 'Equipment created successfully', createEquipment(payload.equipment), callback);
      case 'updateEquipment':
        return jsonResponse(true, 'Equipment updated successfully', updateEquipment(payload.equipment), callback);
      case 'deleteEquipment':
        return jsonResponse(true, 'Equipment deleted successfully', deleteEquipment(payload.id), callback);
      default:
        return jsonResponse(false, 'Unknown API action', null, callback);
    }
  } catch (error) {
    return jsonResponse(false, error.message || 'Request failed', null, callback);
  }
}

function getEmployees() {
  const sheet = getSheet(CONFIG.employeeSheet);
  return readRows(sheet).map(rowToEmployee);
}

function createEmployee(employee) {
  validateEmployee(employee);
  const sheet = getSheet(CONFIG.employeeSheet);
  const headers = getHeaders(sheet);
  if (findEmployeeRow(employee.employeeId)) throw new Error('Employee ID already exists');
  const row = employeeRowValues(headers, employee);
  sheet.appendRow(row);
  return rowToEmployee(rowObject(headers, row));
}

function updateEmployee(employee, previousEmployee) {
  validateEmployee(employee);
  const lookupId = previousEmployee && previousEmployee.employeeId ? previousEmployee.employeeId : employee.employeeId;
  const match = findEmployeeRow(lookupId);
  if (!match) throw new Error('Employee not found');
  const duplicate = findEmployeeRow(employee.employeeId);
  if (duplicate && duplicate.rowIndex !== match.rowIndex) throw new Error('Employee ID already exists');

  const headers = getHeaders(match.sheet);
  const currentRow = rowObject(headers, match.sheet.getRange(match.rowIndex, 1, 1, headers.length).getValues()[0]);
  const current = rowToEmployee(currentRow);
  const merged = Object.assign({}, current, employee);
  const values = employeeRowValues(headers, merged, currentRow);
  match.sheet.getRange(match.rowIndex, 1, 1, headers.length).setValues([values]);

  if (current.name !== merged.name) {
    updateEquipmentAssignee(current.name, merged.name);
  }

  return rowToEmployee(rowObject(headers, values));
}

function deleteEmployee(employee) {
  if (!employee || !employee.employeeId) throw new Error('Employee payload is required');
  const match = findEmployeeRow(employee.employeeId);
  if (!match) throw new Error('Employee not found');
  const headers = getHeaders(match.sheet);
  const current = rowToEmployee(rowObject(headers, match.sheet.getRange(match.rowIndex, 1, 1, headers.length).getValues()[0]));
  match.sheet.deleteRow(match.rowIndex);
  updateEquipmentAssignee(current.name, '');
  return current.employeeId;
}

function findEmployeeRow(employeeId) {
  if (!employeeId) return null;
  const sheet = getSheet(CONFIG.employeeSheet);
  const headers = getHeaders(sheet);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i += 1) {
    const employee = rowToEmployee(rowObject(headers, rows[i]));
    if (String(employee.employeeId).trim() === String(employeeId).trim()) return { sheet, rowIndex: i + 1 };
  }
  return null;
}

function rowToEmployee(row) {
  return {
    employeeId: String(getRowValue(row, ['employee id', 'employeeid', 'id']) || '').trim(),
    name: String(getRowValue(row, ['name', 'full name']) || '').trim(),
    status: String(getRowValue(row, ['status']) || '').trim(),
    position: String(getRowValue(row, ['position']) || '').trim(),
  };
}

function employeeRowValues(headers, employee, currentRow) {
  return headers.map((header) => {
    switch (normalizeHeader(header)) {
      case 'employee id':
      case 'employeeid':
      case 'id':
        return String(employee.employeeId || '').trim();
      case 'name':
      case 'full name':
        return String(employee.name || '').trim();
      case 'status':
        return String(employee.status || '').trim();
      case 'position':
        return String(employee.position || '').trim();
      default:
        return currentRow ? currentRow[header] || '' : '';
    }
  });
}

function getRowValue(row, headerNames) {
  const normalizedNames = headerNames.map(normalizeHeader);
  for (const key in row) {
    if (normalizedNames.indexOf(normalizeHeader(key)) !== -1) return row[key];
  }
  return '';
}

function normalizeHeader(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function validateEmployee(employee) {
  if (!employee) throw new Error('Employee payload is required');
  if (!employee.employeeId) throw new Error('Employee ID is required');
  if (!employee.name) throw new Error('Employee name is required');
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

function updateEquipmentAssignee(previousName, nextName) {
  if (!previousName) return;
  for (const sheetName of CONFIG.equipmentSheets) {
    const sheet = getSheet(sheetName);
    const headers = getHeaders(sheet);
    const issuedToColumn = headers.indexOf('Issued To') + 1;
    if (!issuedToColumn) continue;
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i += 1) {
      if (String(rows[i][issuedToColumn - 1]).trim().toLowerCase() === String(previousName).trim().toLowerCase()) {
        sheet.getRange(i + 1, issuedToColumn).setValue(nextName || '');
      }
    }
  }
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

function parseParams(params) {
  const payload = {};
  for (const key in params) {
    payload[key] = parseParamValue(params[key]);
  }
  return payload;
}

function parseParamValue(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (trimmed[0] !== '{' && trimmed[0] !== '[') return value;
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return value;
  }
}

function stringifyDate(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value);
}

function jsonResponse(success, message, data, callback) {
  const json = JSON.stringify({ success, message, data });
  if (callback) {
    if (!/^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(callback)) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid callback', data: null })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(`${callback}(${json});`).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
