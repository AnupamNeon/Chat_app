import { useThemeStore } from "../store/useThemeStore";
import { Send, Sun, Moon } from "lucide-react";

const THEMES = [
  { id: "light", name: "Light", icon: Sun, description: "Clean and bright" },
  { id: "dark", name: "Dark", icon: Moon, description: "Easy on the eyes" },
];

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Theme</h2>
          <p className="text-gray-600">Choose a theme for your chat interface</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
          {THEMES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                className={`
                  group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
                  ${theme === t.id 
                    ? "border-blue-600 bg-blue-50" 
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-100"
                  }
                `}
                onClick={() => setTheme(t.id)}
              >
                <div className={`
                  p-3 rounded-lg transition-colors
                  ${theme === t.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.description}</div>
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 transition-colors
                  ${theme === t.id ? "border-blue-600 bg-blue-600" : "border-gray-200"}
                `}>
                  {theme === t.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-lg">
            <div className="p-6 bg-gray-100">
              <div className="max-w-lg mx-auto">
                {/* Mock Chat UI */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          J
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-600 rounded-full ring-2 ring-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">John Doe</h3>
                        <p className="text-sm text-gray-600">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-white">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`
                            max-w-[80%] rounded-2xl p-3 shadow-sm
                            ${message.isSent 
                              ? "bg-blue-600 text-white" 
                              : "bg-gray-200 text-gray-900"
                            }
                          `}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`
                              text-xs mt-1.5
                              ${message.isSent ? "text-blue-100" : "text-gray-600"}
                            `}
                          >
                            12:00 PM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message..."
                        value="This is a preview"
                        readOnly
                      />
                      <button className="h-10 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;