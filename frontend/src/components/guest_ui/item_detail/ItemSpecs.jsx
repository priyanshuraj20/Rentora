export default function ItemSpecs() {
  return (
    <section className="mb-10">
      <h3 className="text-xl font-bold mb-4 ">Specifications</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-surface p-6 rounded-xl border-1 border-[#2a2e36]">
        <Spec label="Brand" value="Sony" />
        <Spec label="Model" value="Alpha a7 IV" />
        <Spec label="Mount" value="Sony E-Mount" />
        <Spec label="Weight" value="658g" />
        <Spec label="Condition" value="Like New" bright />
        <Spec label="Included" value="2 Batteries + 128GB Card" />
      </div>
    </section>
  );
}

function Spec({ label, value, bright }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-text-secondary font-bold">
        {label}
      </p>
      <p className={`text-sm font-medium ${bright ? "text-bright" : ""}`}>
        {value}
      </p>
    </div>
  );
}
