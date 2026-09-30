/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],

  content: ['./src/**/*.{js,jsx}'],

  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },

    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },

        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },

        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        /*
        |--------------------------------------------------------------------------
        | Normal Child Clinic Brand Colors
        |--------------------------------------------------------------------------
        */

        ink: {
          DEFAULT: '#173A78',
          soft: '#526783',
          muted: '#7B8CA3',
        },

        /*
        | Primary logo blue
        */
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#7284F4',
          500: '#4D63DE',
          600: '#2F4CC8',
          700: '#263DA5',
          800: '#243683',
          900: '#202F69',
          950: '#151D42',
        },

        /*
        | Main pink / red from clinic logo
        */
        clinic: {
          50: '#FFF0F4',
          100: '#FFE0E8',
          200: '#FFC2D1',
          300: '#FF93AC',
          400: '#FF5D80',
          500: '#FF2D55',
          600: '#EB1743',
          700: '#C80D36',
          800: '#A70F32',
          900: '#8B1230',
          950: '#4E0516',
        },

        /*
        | Alias for previous coral classes.
        | This keeps older UI code working.
        */
        coral: {
          50: '#FFF0F4',
          100: '#FFE0E8',
          200: '#FFC2D1',
          300: '#FF93AC',
          400: '#FF5D80',
          500: '#FF2D55',
          600: '#EB1743',
          700: '#C80D36',
          800: '#A70F32',
          900: '#8B1230',
        },

        /*
        | Logo secondary / decorative colors
        */
        clinicBlue: {
          DEFAULT: '#2F4CC8',
          dark: '#173A78',
          light: '#EEF2FF',
        },

        clinicPink: {
          DEFAULT: '#FF2D55',
          dark: '#C80D36',
          light: '#FFF0F4',
        },

        clinicOrange: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FFF7E6',
        },

        clinicPurple: {
          DEFAULT: '#7C6AD6',
          dark: '#6553C2',
          light: '#F3F0FF',
        },

        /*
        | Background colors
        */
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F8FAFF',
          blue: '#F2F6FF',
          pink: '#FFF5F8',
        },
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',

        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
      },

      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Inter',
          'Poppins',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],

        hand: [
          'var(--font-hand)',
          'cursive',
        ],
      },

      boxShadow: {
        soft: '0 8px 30px rgba(47, 76, 200, 0.08)',
        card: '0 6px 24px rgba(23, 58, 120, 0.08)',
        brand: '0 10px 30px rgba(47, 76, 200, 0.18)',
        clinic: '0 10px 30px rgba(255, 45, 85, 0.18)',
      },

      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #2F4CC8 0%, #5367E3 100%)',

        'clinic-gradient':
          'linear-gradient(135deg, #FF2D55 0%, #FF6480 100%)',

        'hero-gradient':
          'linear-gradient(90deg, #F5F8FF 0%, #FFFFFF 48%, #FFF4F7 100%)',

        'soft-gradient':
          'linear-gradient(135deg, #EEF2FF 0%, #FFF4F7 100%)',
      },

      keyframes: {
        'accordion-down': {
          from: {
            height: 0,
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },

        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: 0,
          },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },

  plugins: [require('tailwindcss-animate')],
};