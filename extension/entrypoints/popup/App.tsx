import { useState, useEffect, useMemo } from "react";
import "./App.css";

// 브라우저 스토리지에 사용자 목록을 저장할 때 사용하는 키
const STORAGE_KEY = "userList";

/**
 * 참여자 정보를 나타내는 인터페이스
 */
interface Participant {
  imgSrc?: string; // 참여자 프로필 이미지 URL
  text?: string;   // 참여자 이름
}

/**
 * 이름을 정규화하여 비교 가능한 형태로 변환합니다.
 * 대소문자, 공백, 마침표, 괄호를 제거하여 일관된 형식으로 만듭니다.
 *
 * @param {string} name - 정규화할 이름
 * @returns {string} 정규화된 이름 (소문자, 공백/마침표/괄호 제거)
 *
 * @example
 * normalizeName("John Doe (Guest)") // "johndoe"
 * normalizeName("Jane.Smith") // "janesmith"
 */
const normalizeName = (name: string): string => {
  return name
    .toLowerCase()            // 소문자로 변환
    .replace(/\s/g, "")       // 모든 공백 제거
    .replace(/\./g, "")       // 모든 마침표 제거
    .replace(/\([^)]*\)/g, ""); // 괄호와 괄호 안 내용 제거
};

/**
 * 메인 애플리케이션 컴포넌트
 * 참여자 확인 및 사용자 목록 관리 기능을 제공합니다.
 */
const App = () => {
  // 상태 관리
  const [users, setUsers] = useState<string[]>([]); // 등록된 사용자 목록
  const [inputValue, setInputValue] = useState(""); // 입력 필드 값
  const [loading, setLoading] = useState(true); // 초기 로딩 상태
  const [participantCount, setParticipantCount] = useState<number | null>(null); // 현재 참여자 수
  const [participants, setParticipants] = useState<Participant[]>([]); // 현재 참여자 목록

  /**
   * 컴포넌트 마운트 시 저장된 사용자 목록을 불러옵니다.
   */
  useEffect(() => {
    /**
     * 브라우저 스토리지에서 사용자 목록을 비동기로 로드합니다.
     * Chrome과 Firefox 확장 프로그램 API를 모두 지원합니다.
     */
    const loadUsers = async () => {
      try {
        // Chrome 또는 Firefox API 확인
        const chrome = (globalThis as any).chrome;
        const browser = (globalThis as any).browser;
        const storage = chrome?.storage?.local || browser?.storage?.local;

        // Storage API를 사용할 수 없는 경우 처리
        if (!storage) {
          console.error("Storage API not available");
          setLoading(false);
          return;
        }

        // Promise로 감싸서 Chrome과 Firefox API 모두 지원
        const result = await new Promise<any>((resolve, reject) => {
          if (chrome) {
            // Chrome API (콜백 방식)
            storage.get(STORAGE_KEY, (result: any) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(result);
              }
            });
          } else if (browser) {
            // Firefox API (Promise 방식)
            storage.get(STORAGE_KEY).then(resolve).catch(reject);
          } else {
            reject(new Error("No storage API available"));
          }
        });

        // 저장된 사용자 목록이 있으면 상태에 설정
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

  /**
   * 사용자 목록을 브라우저 스토리지에 저장합니다.
   * Chrome과 Firefox 확장 프로그램 API를 모두 지원합니다.
   *
   * @param {string[]} newUsers - 저장할 사용자 목록 배열
   */
  const saveUsers = async (newUsers: string[]) => {
    try {
      // Chrome 또는 Firefox API 확인
      const chrome = (globalThis as any).chrome;
      const browser = (globalThis as any).browser;
      const storage = chrome?.storage?.local || browser?.storage?.local;

      // Storage API를 사용할 수 없는 경우 처리
      if (!storage) {
        console.error("Storage API not available");
        return;
      }

      // Promise로 감싸서 Chrome과 Firefox API 모두 지원
      await new Promise<void>((resolve, reject) => {
        if (chrome) {
          // Chrome API (콜백 방식)
          storage.set({ [STORAGE_KEY]: newUsers }, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        } else if (browser) {
          // Firefox API (Promise 방식)
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

  /**
   * 입력 필드에 입력된 사용자를 목록에 추가합니다.
   * 중복된 사용자는 추가되지 않으며, 추가 후 입력 필드를 초기화합니다.
   */
  const handleAddUser = () => {
    const trimmedValue = inputValue.trim();

    // 입력값이 있고 중복되지 않은 경우에만 추가
    if (trimmedValue && !users.includes(trimmedValue)) {
      const newUsers = [...users, trimmedValue];
      setUsers(newUsers); // 상태 업데이트
      setInputValue(""); // 입력 필드 초기화
      saveUsers(newUsers); // 스토리지에 저장
    }
  };

  /**
   * 지정된 사용자를 목록에서 삭제합니다.
   *
   * @param {string} userToDelete - 삭제할 사용자 이름
   */
  const handleDeleteUser = (userToDelete: string) => {
    const newUsers = users.filter((user) => user !== userToDelete);
    setUsers(newUsers); // 상태 업데이트
    saveUsers(newUsers); // 스토리지에 저장
  };

  /**
   * 입력 필드에서 Enter 키를 누르면 사용자를 추가합니다.
   *
   * @param {React.KeyboardEvent<HTMLInputElement>} e - 키보드 이벤트 객체
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddUser();
    }
  };

  /**
   * 현재 활성 탭의 참여자 정보를 확인합니다.
   * Content Script에 메시지를 전송하여 참여자 목록을 가져옵니다.
   */
  const handleCheck = async () => {
    try {
      // Chrome 또는 Firefox API 확인
      const chrome = (globalThis as any).chrome;
      const browser = (globalThis as any).browser;
      const tabs = chrome?.tabs || browser?.tabs;

      // Tabs API를 사용할 수 없는 경우 처리
      if (!tabs) {
        console.error("Tabs API not available");
        return;
      }

      // 현재 활성화된 탭 가져오기
      const [tab] = await tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        console.error("No active tab found");
        return;
      }

      // Chrome과 Firefox의 메시지 전송 API 통합
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

      // Content Script에 참여자 확인 요청
      const response = await sendMessage(tab.id, {
        action: "checkParticipants",
      });

      // 응답 성공 시 참여자 정보 업데이트
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

  /**
   * 정렬된 사용자 목록을 계산합니다.
   * 출석한 사람이 먼저, 같은 상태 내에서는 이름순으로 정렬합니다.
   */
  const sortedUsers = useMemo(() => {
    return users
      .map((user) => {
        const matchedParticipant = participants.find((participant) => {
          if (!participant.text) return false;
          return normalizeName(user) === normalizeName(participant.text);
        });
        return { user, matchedParticipant, isPresent: !!matchedParticipant };
      })
      .sort((a, b) => {
        if (a.isPresent !== b.isPresent) {
          return a.isPresent ? -1 : 1;
        }
        return a.user.localeCompare(b.user);
      });
  }, [users, participants]);

  /**
   * 팝업이 열려 있는 동안 3초 간격으로 참여자 목록을 자동 체크합니다.
   * 로딩이 완료된 후에만 interval이 시작됩니다.
   */
  useEffect(() => {
    if (loading) return;

    // 초기 체크 실행
    handleCheck();

    // 3초 간격으로 체크
    const intervalId = setInterval(() => {
      handleCheck();
    }, 3000);

    // 컴포넌트 언마운트 시 interval 정리
    return () => {
      clearInterval(intervalId);
    };
  }, [loading]);

  // 로딩 중일 때 표시
  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      {/* 참여자 확인 섹션 */}
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

      {/* 사용자 추가 입력 섹션 */}
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

      {/* 사용자 목록 섹션 */}
      <div className="user-list">
        {sortedUsers.length === 0 ? (
          <p className="empty-message">No users added yet</p>
        ) : (
          sortedUsers.map(({ user, matchedParticipant, isPresent }) => (
            <div key={user} className="user-item">
              <div className="user-info">
                {/* 참여 중이고 프로필 이미지가 있으면 표시 */}
                {isPresent && matchedParticipant?.imgSrc && (
                  <img
                    src={matchedParticipant.imgSrc}
                    alt={user}
                    className="user-thumbnail"
                  />
                )}
                <span className="user-name">{user}</span>
                {/* 참여 중인 경우 출석 배지 표시 */}
                {isPresent && <span className="attendance-badge">출석</span>}
              </div>
              <button
                onClick={() => handleDeleteUser(user)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
