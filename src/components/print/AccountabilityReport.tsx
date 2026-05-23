import type { Employee, Equipment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

export function AccountabilityReport({ employee, equipment }: { employee?: Employee; equipment: Equipment[] }) {
  const assignedEquipment = employee ? equipment : equipment.filter((item) => item.issuedTo.trim());
  const total = assignedEquipment.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const employeeGroups = groupEquipmentByEmployee(assignedEquipment);

  return (
    <section className="print-page bg-white p-10 text-black">
      <ReportHeader employee={employee} />
      {employee ? (
        <EquipmentTable equipment={assignedEquipment} />
      ) : (
        <div className="mt-8 space-y-6">
          {employeeGroups.map(([employeeName, items]) => (
            <section key={employeeName} className="print-employee-group">
              <div className="print-employee-heading mb-2 flex items-end justify-between gap-4 border-b border-black pb-1 text-sm">
                <h2 className="font-semibold">{employeeName}</h2>
                <p className="text-xs">
                  {items.length} item{items.length === 1 ? '' : 's'} | {formatCurrency(sumEquipmentValue(items))}
                </p>
              </div>
              <EquipmentTable equipment={items} compact />
            </section>
          ))}
          {!employeeGroups.length ? <p className="text-sm">No assigned equipment records found.</p> : null}
        </div>
      )}
      <div className="mt-4 text-right text-sm font-semibold">Total Value: {formatCurrency(total)}</div>
    </section>
  );
}

function ReportHeader({ employee }: { employee?: Employee }) {
  return (
    <>
      <div className="text-center">
        <p className="text-xs uppercase">Republic of the Philippines</p>
        <h1 className="mt-2 text-lg font-semibold uppercase">Property Accountability Report</h1>
        <p className="text-xs">Equipment Database Management System</p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
        <p>
          <span className="font-semibold">Employee:</span> {employee?.name ?? 'All Employees'}
        </p>
        <p>
          <span className="font-semibold">Employee ID:</span> {employee?.employeeId ?? 'N/A'}
        </p>
        <p>
          <span className="font-semibold">Position:</span> {employee?.position ?? 'N/A'}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {employee?.status ?? 'N/A'}
        </p>
      </div>
    </>
  );
}

function EquipmentTable({ equipment, compact = false }: { equipment: Equipment[]; compact?: boolean }) {
  return (
    <table className={`${compact ? 'mt-0' : 'mt-8'} w-full border-collapse text-xs`}>
      <thead>
        <tr>
          {['Property No.', 'Description', 'Accountability', 'Date', 'Status', 'Amount'].map((head) => (
            <th key={head} className="border border-black px-2 py-2 text-left font-semibold">
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {equipment.map((item) => (
          <tr key={item.id}>
            <td className="border border-black px-2 py-2">{item.propertyNo}</td>
            <td className="border border-black px-2 py-2">{item.itemDescription}</td>
            <td className="border border-black px-2 py-2">{item.accountabilityNo}</td>
            <td className="border border-black px-2 py-2">{formatDate(item.dateIssued)}</td>
            <td className="border border-black px-2 py-2">{item.status}</td>
            <td className="border border-black px-2 py-2">{formatCurrency(item.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function groupEquipmentByEmployee(equipment: Equipment[]) {
  const groups = equipment.reduce<Record<string, Equipment[]>>((acc, item) => {
    const employeeName = item.issuedTo.trim() || 'Unassigned';
    acc[employeeName] = acc[employeeName] ?? [];
    acc[employeeName].push(item);
    return acc;
  }, {});

  return Object.entries(groups).sort(([first], [second]) => first.localeCompare(second));
}

function sumEquipmentValue(equipment: Equipment[]) {
  return equipment.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}
