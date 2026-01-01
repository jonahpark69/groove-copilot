import ToolHeader from "@/components/tool/ToolHeader/ToolHeader";
import ToolLayout from "@/components/tool/ToolLayout/ToolLayout";
import ToolShell from "@/components/tool/ToolShell/ToolShell";

export default function AppPage() {
  return (
    <main className="gp-container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <ToolLayout
        header={<ToolHeader />}
        main={
          <ToolShell
            title="Sequencer"
            description="Placeholder Jour 4. Le sequencer arrive Jour 7."
          >
            <div
              className="gp-muted"
              style={{
                minHeight: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Sequencer en préparation.
            </div>
          </ToolShell>
        }
        aside={
          <ToolShell
            title="Coach"
            description="Placeholder Jour 4. Le coach audio arrive Jour 9."
          >
            <div
              className="gp-muted"
              style={{
                minHeight: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Coach en préparation.
            </div>
          </ToolShell>
        }
      />
    </main>
  );
}
