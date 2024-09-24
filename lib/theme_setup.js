// import * as Cookies from 'es-cookie';

const Cookies = {
    stringifyAttribute(name, value) {
        if (!value) return '';
        name = '; ' + name;
        return value === true ? name : name + '=' + value;
    },
    stringifyAttributes(attributes) {
        if (typeof attributes.expires === 'number') {
            attributes.expires = new Date(Math.min(Date.now() + attributes.expires * 864e+5, 864e+13));
        }
        return Cookies.stringifyAttribute('Expires', attributes.expires ? attributes.expires.toUTCString() : '')
            + Cookies.stringifyAttribute('Domain', attributes.domain)
            + Cookies.stringifyAttribute('Path', attributes.path)
            + Cookies.stringifyAttribute('Secure', attributes.secure)
            + Cookies.stringifyAttribute('Partitioned', attributes.partitioned)
            + Cookies.stringifyAttribute('SameSite', attributes.sameSite);
    },
    encode(name, value, attributes) {
        return encodeURIComponent(name)
                .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent) // allowed special characters
                .replace(/\(/g, '%28').replace(/\)/g, '%29') // replace opening and closing parens
            + '=' + encodeURIComponent(value)
                // allowed special characters
                .replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)
            + Cookies.stringifyAttributes(attributes);
    },
    parse(cookieString) {
        let result = {};
        const cookies = cookieString ? cookieString.split('; ') : [];
        for (let cookie of cookies) {
            const parts = cookie.split('=');
            let value = parts.slice(1).join('=');
            if (value[0] === '"') {
                value = value.slice(1, -1);
            }
            try {
                const name = decodeURIComponent(parts[0]);
                result[name] = value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
            }
            catch (e) {
                // ignore cookies with invalid name/value encoding
            }
        }
        return result;
    },
    get: (name) => Cookies.parse(document.cookie)[name],
    set: (name, value, attributes) => document.cookie = Cookies.encode(name, value, {path: '/', ...attributes}),
    remove: (name, attributes) => Cookies.set(name, '', {...attributes, expires: -1})

}

const themeManager = {
    _cookieKey: 'COLOR-THEME',
    _setThemeOnHtml: (newTheme) => {
        themeManager.isDark = newTheme === 'dark';
        document.querySelector('html').classList.toggle('dark', newTheme === 'dark');
        themeManager.listener?.call(newTheme);
    },
    _getCurrent: () => {
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', event => {
                themeManager.update(event.matches ? "dark" : "light")
            });
        return Cookies.get(themeManager._cookieKey) ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");
    },
    _init: () => {
        console.log('init');
        const _initialCookieTheme = themeManager._getCurrent();
        themeManager._setThemeOnHtml(_initialCookieTheme);
        setTimeout(() => {
            document.querySelector('html').style.background = 'none';
        }, 1000);
    },
    update: (newTheme) => {
        Cookies.set(themeManager._cookieKey, newTheme)
        themeManager._setThemeOnHtml(newTheme);
        return newTheme;
    },
    toggle: () => {
        return themeManager.update(themeManager.isDark ? "light" : "dark");
    },
    isDark: false,
    listener: undefined,
}

// themeManager._init();

window.themeManager = themeManager;
