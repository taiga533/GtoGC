import AlertList from "./components/AlertList"
import { AlertProvider } from "./hooks/useAlert"
import { SettingPage } from "./pages/SettingPage"

import "./../style.css"

function App() {
  return (
    <div data-theme="cupcake">
      <AlertProvider>
        <div className="artboard w-[640px] h-[500px] m-3">
          <AlertList />
          <SettingPage />
        </div>
      </AlertProvider>
    </div>
  )
}

export default App
