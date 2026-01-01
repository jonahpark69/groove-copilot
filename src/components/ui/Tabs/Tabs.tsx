import styles from "./Tabs.module.scss";

type TabsItem = {
  id: string;
  label: string;
  badge?: string | number;
  disabled?: boolean;
};

type TabsProps = {
  items: TabsItem[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
};

export default function Tabs({
  items,
  activeId,
  onChange,
  ariaLabel,
}: TabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const tabId = `tabs-${item.id}`;
        const panelId = `tabs-panel-${item.id}`;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={tabId}
            aria-selected={isActive}
            aria-controls={panelId}
            disabled={item.disabled}
            className={[
              styles.tab,
              isActive ? styles.active : "",
              item.disabled ? styles.disabled : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              if (!item.disabled && item.id !== activeId) {
                onChange(item.id);
              }
            }}
          >
            <span className={styles.label}>{item.label}</span>
            {item.badge !== undefined && item.badge !== null && (
              <span className={styles.badge}>{item.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
