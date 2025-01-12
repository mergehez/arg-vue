import ic from './iconify-sets/ic.d';
import mdi from './iconify-sets/mdi.d';
import fluent from './iconify-sets/fluent.d';
import mingcute from './iconify-sets/mingcute.d';

export type MingCuteIcon = mingcute;
export type FluentIcon = fluent;
export type MdiIcon = mdi;
export type IcIcon = ic;
export type IconifyIcon = ic | mdi | fluent | mingcute;
export type IconifyIconPrefixed = `icon-[${IconifyIcon}]`;