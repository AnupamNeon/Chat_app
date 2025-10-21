import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Sun, Moon, Monitor } from "lucide-react";

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
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Theme Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a theme for your chat interface
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
            <AnimatePresence mode="wait">
              {THEMES.map((t, index) => {
                const Icon = t.icon;
                return (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      theme === t.id
                        ? "border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/10 shadow-lg"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800"
                    }`}
                    onClick={() => setTheme(t.id)}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`p-3 rounded-lg transition-all ${
                        theme === t.id
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {t.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t.description}
                      </div>
                    </div>
                    <motion.div
                      animate={{
                        scale: theme === t.id ? 1 : 0.8,
                        rotate: theme === t.id ? 0 : 180
                      }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        theme === t.id
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {theme === t.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 rounded-full bg-white"
                        />
                      )}
                    </motion.div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Preview
            </h3>
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-2xl">
              <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-lg mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
                  >
                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium shadow-lg"
                          >
                            J
                          </motion.div>
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            John Doe
                          </h3>
                          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                            Online
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-gray-50 dark:bg-gray-900">
                      <AnimatePresence>
                        {PREVIEW_MESSAGES.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className={`flex ${
                              message.isSent ? "justify-end" : "justify-start"
                            }`}
                          >
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
                                message.isSent
                                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none"
                                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-700"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1.5 ${
                                  message.isSent
                                    ? "text-blue-100"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                12:00 PM
                              </p>
                            </motion.div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Type a message..."
                          value="This is a preview"
                          readOnly
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg"
                        >
                          <Send size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;