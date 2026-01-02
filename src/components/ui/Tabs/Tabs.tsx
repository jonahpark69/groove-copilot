import { cx } from "@/lib/cx";
import styles from "./Tabs.module.scss";

type TabItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
};

export default function Tabs({ items, value, onChange, ariaLabel }: TabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive = item.id === value;
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
            className={cx(
              styles.tab,
              isActive && styles.active,
              item.disabled && styles.disabled
            )}
            onClick={() => {
              if (!item.disabled && item.id !== value) {
                onChange(item.id);
              }
            }}
          >
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
