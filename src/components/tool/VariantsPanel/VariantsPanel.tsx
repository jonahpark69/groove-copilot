"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui";
import type { Pattern } from "@/features/engine/pattern";
import { getCoachSuggestions } from "@/features/engine/suggestions";
import type { StylePreset } from "@/features/engine/types";
import type { ActiveVariantId, ToolVariant } from "@/features/state/toolState";
import styles from "./VariantsPanel.module.scss";

type VariantsPanelProps = {
  preset: StylePreset;
  bpm: number;
  steps: 16 | 32;
  pattern: Pattern;
  variants: ToolVariant[];
  activeVariantId: ActiveVariantId;
  onSelect: (id: ActiveVariantId) => void;
};

export default function VariantsPanel({
  preset,
  bpm,
  steps,
  pattern,
  variants,
  activeVariantId,
  onSelect,
}: VariantsPanelProps) {
  const suggestions = useMemo(
    () => getCoachSuggestions({ pattern, preset, steps, bpm }),
    [pattern, preset, steps, bpm]
  );

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Variantes</h2>
          <p className={styles.subtitle}>
            3 variations rapides a tester, basees sur ton pattern.
          </p>
        </div>
      </div>

      <div className={styles.cards}>
        {variants.length === 0 ? (
          <div className={styles.card}>
            <div>
              <h3 className={styles.cardTitle}>Aucune variante</h3>
              <p className={styles.cardDescription}>
                Clique sur Generate pour proposer des variations.
              </p>
            </div>
          </div>
        ) : (
          variants.map((variant) => {
            const isActive = activeVariantId === variant.id;
            return (
              <div key={variant.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{variant.name}</h3>
                    <p className={styles.cardDescription}>{variant.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelect(variant.id)}
                    disabled={isActive}
                  >
                    {isActive ? "Active" : "Utiliser"}
                  </Button>
                </div>
                <div className={styles.metrics}>
                  <span>Hits: {variant.metrics.hits}</span>
                  <span>Density: {variant.metrics.density.toFixed(2)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Conseils</h3>
        {suggestions.length === 0 ? (
          <p className={styles.subtitle}>Aucun conseil pour le moment.</p>
        ) : (
          <div className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <div key={`${suggestion.title}-${index}`} className={styles.suggestion}>
                <span
                  className={`${styles.severity} ${styles[suggestion.severity]}`}
                >
                  {suggestion.severity}
                </span>
                <div>
                  <p className={styles.suggestionTitle}>{suggestion.title}</p>
                  <p className={styles.suggestionBody}>{suggestion.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
