import { FormEvent, useRef, useState } from "react";
import { Leaf, Mic, Send, Volume2 } from "lucide-react";
import { Card, SectionEyebrow } from "../components/ui/primitives";
import Button from "../components/ui/Button";
import { sendAdvisorMessage, AdvisorChatMessage } from "../lib/api";
import { advisorSuggestedQuestions } from "../lib/mockData";
import { cn } from "../lib/utils";
import { useI18n } from "../lib/i18n";

export default function AIFarmAdvisor() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<AdvisorChatMessage[]>([
    {
      role: "assistant",
      content:
        "Namaste! I've looked at your soil report, this week's weather, and your plots. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: AdvisorChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const response = await sendAdvisorMessage(text, messages);
      setMessages((m) => [...m, { role: "assistant", content: response.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I am having trouble connecting to the advisor. Please try again later." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <SectionEyebrow>{t("advisor")}</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-forest-dark mb-1">{t("askAdvisor")}</h1>
      <p className="text-ink-soft text-sm mb-6">Grounded in your soil report, weather and crop data. Answers in text or voice, in your language.</p>

      <Card className="p-0 overflow-hidden">
        <div className="h-[52vh] min-h-[360px] overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
              <span
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  m.role === "assistant" ? "bg-canopy text-husk" : "bg-husk-dim text-forest-dark"
                )}
              >
                {m.role === "assistant" ? <Leaf size={15} /> : "R"}
              </span>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "assistant" ? "bg-husk-dim text-ink" : "bg-forest text-husk"
                )}
              >
                {m.content}
                {m.role === "assistant" && (
                  <button className="flex items-center gap-1 text-xs text-canopy font-medium mt-2">
                    <Volume2 size={12} /> Play aloud
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <span className="w-8 h-8 rounded-full bg-canopy text-husk flex items-center justify-center shrink-0">
                <Leaf size={15} />
              </span>
              <div className="bg-husk-dim rounded-2xl px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-canopy/50 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length < 3 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {advisorSuggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-forest/15 text-forest-dark hover:bg-husk-dim transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="border-t border-forest/10 p-3 flex items-center gap-2">
          <button type="button" className="w-10 h-10 rounded-full border border-forest/15 text-forest flex items-center justify-center shrink-0 hover:bg-husk-dim">
            <Mic size={16} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or speak your question..."
            className="flex-1 rounded-full border border-forest/15 px-4 py-2.5 text-sm outline-none focus:border-canopy"
          />
          <Button type="submit" size="sm" className="!rounded-full !w-10 !h-10 !p-0" disabled={loading}>
            <Send size={15} />
          </Button>
        </form>
      </Card>
    </div>
  );
}
