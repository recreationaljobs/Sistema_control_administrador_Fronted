import AppRouter from "./app/router";
import NotificacionesPrimerPlano
  from "./components/NotificacionesPrimerPlano";

const App = () => {
  return (
    <>
      <NotificacionesPrimerPlano />
      <AppRouter />
    </>
  );
};

export default App;