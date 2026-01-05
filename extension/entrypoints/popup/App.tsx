import { useState, useEffect } from "react";
import "./App.css";

const STORAGE_KEY = "userList";

interface Participant {
  imgSrc?: string;
  text?: string;
}

const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/\([^)]*\)/g, ""); // 괄호 포함 괄호안 내용 삭제
};

const App = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const chrome = (globalThis as any).chrome;
        const browser = (globalThis as any).browser;
        const storage = chrome?.storage?.local || browser?.storage?.local;

        if (!storage) {
          console.error("Storage API not available");
          setLoading(false);
          return;
        }

        const result = await new Promise<any>((resolve, reject) => {
          if (chrome) {
            storage.get(STORAGE_KEY, (result: any) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(result);
              }
            });
          } else if (browser) {
            storage.get(STORAGE_KEY).then(resolve).catch(reject);
          } else {
            reject(new Error("No storage API available"));
          }
        });

        const savedUsers = result[STORAGE_KEY] as string[] | undefined;
        if (savedUsers) {
          setUsers(savedUsers);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const saveUsers = async (newUsers: string[]) => {
    try {
      const chrome = (globalThis as any).chrome;
      const browser = (globalThis as any).browser;
      const storage = chrome?.storage?.local || browser?.storage?.local;

      if (!storage) {
        console.error("Storage API not available");
        return;
      }

      await new Promise<void>((resolve, reject) => {
        if (chrome) {
          storage.set({ [STORAGE_KEY]: newUsers }, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        } else if (browser) {
          storage
            .set({ [STORAGE_KEY]: newUsers })
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error("No storage API available"));
        }
      });
    } catch (error) {
      console.error("Failed to save users:", error);
    }
  };

  const handleAddUser = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !users.includes(trimmedValue)) {
      const newUsers = [...users, trimmedValue];
      setUsers(newUsers);
      setInputValue("");
      saveUsers(newUsers);
    }
  };

  const handleDeleteUser = (userToDelete: string) => {
    const newUsers = users.filter((user) => user !== userToDelete);
    setUsers(newUsers);
    saveUsers(newUsers);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddUser();
    }
  };

  const handleCheck = async () => {
    try {
      const chrome = (globalThis as any).chrome;
      const browser = (globalThis as any).browser;
      const tabs = chrome?.tabs || browser?.tabs;

      if (!tabs) {
        console.error("Tabs API not available");
        return;
      }

      const [tab] = await tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        console.error("No active tab found");
        return;
      }

      const sendMessage = chrome
        ? (tabId: number, message: any) =>
            new Promise((resolve) => {
              chrome.tabs.sendMessage(tabId, message, resolve);
            })
        : browser?.tabs?.sendMessage;

      if (!sendMessage) {
        console.error("SendMessage API not available");
        return;
      }

      const response = await sendMessage(tab.id, {
        action: "checkParticipants",
      });
      if (response?.success) {
        setParticipants(response.data);
        setParticipantCount(response.data.length);
      } else {
        console.error("Failed to check participants:", response?.error);
      }
    } catch (error) {
      console.error("Error checking participants:", error);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="check-section">
        {participantCount !== null ? (
          <span className="participant-count">{participantCount}명 참여중</span>
        ) : (
          <span className="participant-count">확인필요</span>
        )}
        <button onClick={handleCheck} className="check-button">
          Check
        </button>
      </div>
      <div className="input-section">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter user name"
          className="input-field"
        />
        <button onClick={handleAddUser} className="add-button">
          Add
        </button>
      </div>
      <div className="user-list">
        {users.length === 0 ? (
          <p className="empty-message">No users added yet</p>
        ) : (
          users.map((user) => {
            const matchedParticipant = participants.find((participant) => {
              if (!participant.text) return false;
              return normalizeName(user) === normalizeName(participant.text);
            });
            const isPresent = !!matchedParticipant;

            return (
              <div key={user} className="user-item">
                <div className="user-info">
                  {isPresent && matchedParticipant?.imgSrc && (
                    <img
                      src={matchedParticipant.imgSrc}
                      alt={user}
                      className="user-thumbnail"
                    />
                  )}
                  <span className="user-name">{user}</span>
                  {isPresent && <span className="attendance-badge">출석</span>}
                </div>
                <button
                  onClick={() => handleDeleteUser(user)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default App;
