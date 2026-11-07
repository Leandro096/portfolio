import { iconToSVG, replaceIDs } from "@iconify/utils";
import allIcons from "./icon-sets";

// ----------------------------------------------------------------------

export type IconifyName = keyof typeof allIcons;

export interface IconData {
  body: string;
  width?: number;
  height?: number;
}

export interface IconSet {
  prefix: string;
  icons: Record<string, IconData>;
}

export const iconSets = Object.entries(
  allIcons as Record<string, IconData>,
).reduce<IconSet[]>((acc, [key, value]) => {
  const [prefix, iconName] = key.split(":");
  const existing = acc.find((item) => item.prefix === prefix);

  if (existing) {
    existing.icons[iconName] = value;
  } else {
    acc.push({ prefix, icons: { [iconName]: value } });
  }

  return acc;
}, []);

export const allIconNames = Object.keys(allIcons) as IconifyName[];

// ----------------------------------------------------------------------

const DEFAULT_SIZE = 24;
const SET_SIZES: Record<string, number> = { carbon: 32 };

export function getIcon(name: IconifyName) {
  const [prefix, iconName] = name.split(":");
  const data = iconSets.find((set) => set.prefix === prefix)?.icons[iconName];

  if (!data) return undefined;

  const size = SET_SIZES[prefix] ?? DEFAULT_SIZE;
  const { body, attributes } = iconToSVG({
    width: size,
    height: size,
    ...data,
  });

  return { body: replaceIDs(body), viewBox: attributes.viewBox };
}
