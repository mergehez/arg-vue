type Ic<T extends Record<string, string[]>> = T[keyof T][number]
type Unprefixed = Ic<IconSet>
type Prefix = 'aaaaa';
type Icon = `${Prefix}--${Unprefixed}`
export default Icon

type IconSet = aaa