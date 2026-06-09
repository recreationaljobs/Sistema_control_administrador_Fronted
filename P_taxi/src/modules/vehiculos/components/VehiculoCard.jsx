const VehiculoCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${color}`}>
          <Icon size={28} />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <h3 className="mt-1 text-3xl font-black text-slate-950">{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default VehiculoCard;