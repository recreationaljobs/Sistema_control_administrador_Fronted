const Loading = ({ text = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-yellow-400 animate-spin" />
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
};

export default Loading;
