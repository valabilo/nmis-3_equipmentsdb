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
    return readRowsWithIndexes(sheet).map((item) => normalizeEquipment(item.row, sheetName, item.rowIndex));
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
    switch (normalizeHeader(header)) {
      case 'article':
        return equipment.article || '';
      case 'property no.':
      case 'property no':
      case 'property number':
        return equipment.propertyNo || '';
      case 'item description':
      case 'description':
        return equipment.itemDescription || '';
      case 'amount':
        return equipment.amount || 0;
      case 'par no.':
      case 'par no':
      case 'ics no.':
      case 'ics no':
        return normalizeHeader(header) === normalizeHeader(accountabilityHeader) ? equipment.accountabilityNo || '' : '';
      case 'issued to':
        return equipment.issuedTo || '';
      case 'date issued':
        return equipment.dateIssued || '';
      case 'status':
        return equipment.status || '';
      case 'location':
        return equipment.location || '';
      case 'remarks':
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
  const match = findEquipmentRow(equipment.id) || findEquipmentRowByProperty(equipment.category, equipment.propertyNo);
  if (!match) throw new Error('Equipment not found');
  const sheet = match.sheet;
  const headers = getHeaders(sheet);
  const statusColumn = findHeaderIndex(headers, ['status']) + 1;
  if (!statusColumn) throw new Error(`Missing Status column on sheet: ${match.sheetName}`);
  const current = rowObject(headers, sheet.getRange(match.rowIndex, 1, 1, headers.length).getValues()[0]);
  const merged = Object.assign({}, normalizeEquipment(current, match.sheetName, match.rowIndex), equipment);
  const accountabilityHeader = merged.accountabilityType === 'ICS' ? 'ICS No.' : 'PAR No.';
  const values = headers.map((header) => {
    switch (normalizeHeader(header)) {
      case 'article':
        return merged.article;
      case 'property no.':
      case 'property no':
      case 'property number':
        return merged.propertyNo;
      case 'item description':
      case 'description':
        return merged.itemDescription;
      case 'amount':
        return merged.amount;
      case 'par no.':
      case 'par no':
      case 'ics no.':
      case 'ics no':
        return normalizeHeader(header) === normalizeHeader(accountabilityHeader) ? merged.accountabilityNo : '';
      case 'issued to':
        return merged.issuedTo;
      case 'date issued':
        return merged.dateIssued;
      case 'status':
        return merged.status;
      case 'location':
        return merged.location;
      case 'remarks':
        return merged.remarks;
      default:
        return current[header] || '';
    }
  });
  sheet.getRange(match.rowIndex, 1, 1, headers.length).setValues([values]);
  sheet.getRange(match.rowIndex, statusColumn).setValue(String(merged.status || '').trim());
  SpreadsheetApp.flush();

  const saved = rowObject(headers, sheet.getRange(match.rowIndex, 1, 1, headers.length).getValues()[0]);
  const updated = normalizeEquipment(saved, match.sheetName, match.rowIndex);
  if (String(updated.status || '').trim() !== String(merged.status || '').trim()) {
    throw new Error(`Status did not save. Expected "${merged.status || ''}", got "${updated.status || ''}"`);
  }

  return updated;
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

function findEquipmentRowByProperty(category, propertyNo) {
  if (!category || !propertyNo) return null;
  const sheet = getSheet(category);
  const headers = getHeaders(sheet);
  const rows = sheet.getDataRange().getValues();
  const propertyNoColumn = findHeaderIndex(headers, ['property no.', 'property no', 'property number']) + 1;
  if (!propertyNoColumn) return null;
  const target = normalizeLookupValue(propertyNo);
  for (let i = 1; i < rows.length; i += 1) {
    if (normalizeLookupValue(rows[i][propertyNoColumn - 1]) === target) {
      return { sheet, sheetName: category, rowIndex: i + 1 };
    }
  }
  return null;
}

function normalizeEquipment(row, category, rowIndex) {
  const par = getRowValue(row, ['par no.', 'par no']) || '';
  const ics = getRowValue(row, ['ics no.', 'ics no']) || '';
  return {
    id: `${category}::${rowIndex}::${getRowValue(row, ['property no.', 'property no', 'property number']) || ''}`,
    category,
    article: getRowValue(row, ['article']) || '',
    propertyNo: getRowValue(row, ['property no.', 'property no', 'property number']) || '',
    itemDescription: getRowValue(row, ['item description', 'description']) || '',
    amount: Number(getRowValue(row, ['amount']) || 0),
    accountabilityNo: par || ics,
    accountabilityType: ics ? 'ICS' : 'PAR',
    issuedTo: getRowValue(row, ['issued to']) || '',
    dateIssued: stringifyDate(getRowValue(row, ['date issued'])),
    status: getRowValue(row, ['status']) || '',
    location: getRowValue(row, ['location']) || '',
    remarks: getRowValue(row, ['remarks']) || '',
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
  return readRowsWithIndexes(sheet).map((item) => item.row);
}

function readRowsWithIndexes(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values
    .slice(1)
    .map((row, index) => ({ row, rowIndex: index + 2 }))
    .filter((item) => item.row.some(Boolean))
    .map((item) => ({ row: rowObject(headers, item.row), rowIndex: item.rowIndex }));
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

function findHeaderIndex(headers, headerNames) {
  const normalizedNames = headerNames.map(normalizeHeader);
  for (let i = 0; i < headers.length; i += 1) {
    if (normalizedNames.indexOf(normalizeHeader(headers[i])) !== -1) return i;
  }
  return -1;
}

function normalizeLookupValue(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
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
