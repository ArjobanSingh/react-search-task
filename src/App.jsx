import items from "./assets/data.json";
import Search from "./components/Search";

function App() {
  return (
    <div className="flex h-screen w-full flex-col items-center p-10">
      <Search items={items} />
    </div>
  );
}

export default App;
