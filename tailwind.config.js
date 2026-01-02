import { fontFamily } from 'tailwindcss/defaultTheme';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			black: colors.black,
			white: colors.white,
			neutral: colors.neutral,
			zinc: colors.zinc,
			pink: {
				50: '#fff4ff',
				100: '#ffe7ff',
				200: '#ffc6ff',
				300: '#fea9fa',
				400: '#fc76f4',
				500: '#f342e7',
				600: '#d722c8',
				700: '#b219a1',
				800: '#921684',
				900: '#771869',
				950: '#500246'
			},
			purple: {
				50: '#f4f3ff',
				100: '#ebe8ff',
				200: '#d9d5ff',
				300: '#bdb2ff',
				400: '#9d88fd',
				500: '#7e58fa',
				600: '#6f35f2',
				700: '#6023de',
				800: '#501dba',
				900: '#431a98',
				950: '#270e67'
			},
			blue: {
				50: '#cce0ff',
				100: '#d1e1ff',
				200: '#bdd4ff',
				300: '#9ec3ff',
				400: '#5d95fd',
				500: '#386ffa',
				600: '#1f4cef',
				700: '#1839dc',
				800: '#1b31b1',
				900: '#1c2f8d',
				950: '#161e55'
			},
			green: {
				50: '#f3fff0',
				100: '#dcffd6',
				200: '#c8ffbd',
				300: '#8bfd77',
				400: '#52f236',
				500: '#2ada0b',
				600: '#1db503',
				700: '#1b8d07',
				800: '#1a6f0b',
				900: '#165a0c',
				950: '#063300'
			},
			yellow: {
				50: '#fefee8',
				100: '#fdffb6',
				200: '#fffe88',
				300: '#fff744',
				400: '#fee911',
				500: '#eecf04',
				600: '#cda201',
				700: '#a47404',
				800: '#875b0c',
				900: '#734a10',
				950: '#432705'
			},
			orange: {
				50: '#fff7ed',
				100: '#ffedd5',
				200: '#ffd6a5',
				300: '#ffbb72',
				400: '#fd943a',
				500: '#fc7513',
				600: '#ed5909',
				700: '#c4420a',
				800: '#9c3410',
				900: '#7d2d11',
				950: '#441506'
			},
			red: {
				50: '#fef2f2',
				100: '#ffe1e1',
				200: '#ffc8c8',
				300: '#ffadad',
				400: '#fd6c6c',
				500: '#f53e3e',
				600: '#e22020',
				700: '#be1717',
				800: '#9d1717',
				900: '#821a1a',
				950: '#470808'
			},
			cyan: {
				50: '#cce0ff',
				100: '#d1e1ff',
				200: '#bdd4ff',
				300: '#9ec3ff',
				400: '#5d95fd',
				500: '#386ffa',
				600: '#1f4cef',
				700: '#1839dc',
				800: '#1b31b1',
				900: '#1c2f8d',
				950: '#161e55'
			}
		},
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'rgb(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				}
			},

			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: [...fontFamily.sans]
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--bits-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--bits-accordion-content-height)' },
					to: { height: '0' }
				},
				'caret-blink': {
					'0%,70%,100%': { opacity: '1' },
					'20%,50%': { opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'caret-blink': 'caret-blink 1.25s ease-out infinite'
			}
		}
	}
};

export default config;
