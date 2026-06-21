const EmptyState = ({ title = "Sin resultados", description = "No hay datos para mostrar.", icon: Icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {Icon && (
        <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Icon size={32} />
        </div>
      )}
      <div>
        <p className="text-base font-bold text-slate-700">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
