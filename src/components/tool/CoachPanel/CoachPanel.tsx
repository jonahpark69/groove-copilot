import type { StylePreset } from "@/features/engine/types";
import styles from "./CoachPanel.module.scss";

type CoachPanelProps = {
  preset: StylePreset;
};

export default function CoachPanel({ preset }: CoachPanelProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>Coach</h2>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Structure</h3>
        <ul className={styles.list}>
          {preset.structure.sectionOrder.map((section, index) => (
            <li key={`${section.id}-${index}`} className={styles.listItem}>
              <span className={styles.itemTitle}>
                {section.id} • {section.bars} bars
              </span>
              {section.notes && (
                <span className={styles.muted}>{section.notes}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Instruments</h3>
        <div className={styles.columns}>
          <div>
            <p className={styles.label}>Core</p>
            <ul className={styles.list}>
              {preset.coach.instrumentsCore.map((item) => (
                <li key={item} className={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.label}>Optional</p>
            <ul className={styles.list}>
              {preset.coach.instrumentsOptional.map((item) => (
                <li key={item} className={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>FX Packs</h3>
        <div className={styles.stack}>
          {preset.coach.fxPacks.map((pack) => (
            <div key={pack.name}>
              <h4 className={styles.subTitle}>{pack.name}</h4>
              <ul className={styles.list}>
                {pack.items.map((item) => (
                  <li key={item} className={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Mix Tips</h3>
        <ul className={styles.list}>
          {preset.coach.mixTips.map((tip) => (
            <li key={tip} className={styles.listItem}>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Similar Tracks</h3>
        <div className={styles.stack}>
          {preset.similarTracks.map((track) => (
            <div key={`${track.title}-${track.artist}`} className={styles.trackCard}>
              <div className={styles.trackHeader}>
                <span className={styles.itemTitle}>
                  {track.title} — {track.artist}
                  {track.year ? ` (${track.year})` : ""}
                </span>
              </div>
              {track.tags && track.tags.length > 0 && (
                <div className={styles.badges}>
                  {track.tags.map((tag) => (
                    <span key={tag} className={styles.badge}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
