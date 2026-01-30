export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    const runtime =
      (globalThis as any).chrome?.runtime ||
      (globalThis as any).browser?.runtime;

    if (runtime?.onMessage) {
      runtime.onMessage.addListener(
        (message: any, sender: any, sendResponse: (response: any) => void) => {
          if (message.action === "checkParticipants") {
            try {
              const result = Array.from(
                document.querySelectorAll('div[role="listitem"]'),
              )
                .map((item) => {
                  const imgSrc = item.querySelector("img")?.src;
                  const text = item.querySelector("span")?.textContent;
                  return { imgSrc, text };
                })
                .filter(
                  ({ text }) =>
                    ![
                      "병합된 오디오",
                      "참석함",
                      "응답 없음",
                      "거절함",
                    ].includes(text ?? ""),
                );
              sendResponse({ success: true, data: result });
            } catch (error) {
              sendResponse({ success: false, error: String(error) });
            }
            return true;
          }
        },
      );
    }
  },
});
