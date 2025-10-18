interface LegendItem {
  label: string;
  color: string;
}

export default function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex space-x-4 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex items-center space-x-1">
          <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
