import type { Employee, Equipment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

const MAX_PRINT_ROW_WEIGHT = 12;

export function AccountabilityReport({ employee, equipment }: { employee?: Employee; equipment: Equipment[] }) {
  const total = equipment.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pages = paginateEquipment(equipment);
  const showSignatureBlock = Boolean(employee);

  return (
    <>
      {pages.map((items, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;

        return (
          <section key={`print-page-${pageIndex}`} className="print-page flex flex-col bg-white p-10 text-black">
            <ReportHeader employee={employee} />
            <EquipmentTable equipment={items} />
            {isLastPage ? (
              <>
                <div className="mt-4 text-right text-sm font-semibold">Total Value: {formatCurrency(total)}</div>
                {showSignatureBlock ? (
                  <div className="mt-16 grid grid-cols-2 gap-16 text-center text-xs">
                    <div>
                      <div className="border-t border-black pt-2">Issued By / Property Officer</div>
                    </div>
                    <div>
                      <div className="border-t border-black pt-2">Received By / Accountable Employee</div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
            <div className="mt-auto pt-6 text-right text-[10px] text-zinc-600">
              Page {pageIndex + 1} of {pages.length}
            </div>
          </section>
        );
      })}
    </>
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

function EquipmentTable({ equipment }: { equipment: Equipment[] }) {
  return (
    <table className="mt-8 w-full border-collapse text-xs">
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

function paginateEquipment(equipment: Equipment[]) {
  const source = equipment.length ? equipment : ([] as Equipment[]);
  const pages: Equipment[][] = [];
  let currentPage: Equipment[] = [];
  let currentWeight = 0;

  for (const item of source) {
    const rowWeight = getPrintRowWeight(item);
    if (currentPage.length && currentWeight + rowWeight > MAX_PRINT_ROW_WEIGHT) {
      pages.push(currentPage);
      currentPage = [];
      currentWeight = 0;
    }

    currentPage.push(item);
    currentWeight += rowWeight;
  }

  if (currentPage.length || !pages.length) pages.push(currentPage);
  return pages;
}

function getPrintRowWeight(item: Equipment) {
  const textLength = [item.propertyNo, item.itemDescription, item.accountabilityNo, item.status, formatCurrency(item.amount)]
    .join(' ')
    .length;
  return Math.max(1, Math.ceil(textLength / 130));
}
