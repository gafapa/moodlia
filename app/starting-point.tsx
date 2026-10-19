"use client";

import { useState } from "react";
import { cinematicCopy } from "./cinematic-copy";
import type { Locale } from "./content";
import { appPath } from "./i18n";
import { ArrowIcon } from "./icons";

export function StartingPoint({ locale }: { locale: Locale }) {
  const [selected, setSelected] = useState(1);
  const copy = cinematicCopy[locale];
  const destinations = [appPath("moodle-plugin", locale), appPath("rubrics", locale), appPath("corrector", locale), "/tools/backup-converter/"];
  return <div className="starting-point">
    <fieldset><legend>{copy.choosePrompt}</legend><div className="starting-options">{copy.choices.map((choice, index) => <label key={choice} className={selected === index ? "is-selected" : ""}><input type="radio" name="starting-point" checked={selected === index} onChange={() => setSelected(index)} /><span>{choice}</span><ArrowIcon /></label>)}</div></fieldset>
    <div className="starting-result" aria-live="polite"><p>{copy.choiceDescriptions[selected]}</p><a className="story-button" href={destinations[selected]}>{copy.choiceActions[selected]}<ArrowIcon /></a></div>
    <noscript><style>{`.starting-point{display:none}`}</style></noscript>
  </div>;
}
