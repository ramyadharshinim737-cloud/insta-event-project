// Animation configurations for smooth, natural motion
const animations = {
    // Timing durations
    duration: {
        instant: 0,
        fast: 150,
        normal: 250,
        slow: 350,
        slower: 500,
    },

    // Easing functions
    easing: {
        linear: 'linear',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
    },

    // Spring configurations for natural motion
    spring: {
        gentle: {
            damping: 20,
            stiffness: 300,
        },
        bouncy: {
            damping: 10,
            stiffness: 400,
        },
        stiff: {
            damping: 30,
            stiffness: 500,
        },
    },

    // Common animation presets
    presets: {
        fadeIn: {
            duration: 250,
            from: { opacity: 0 },
            to: { opacity: 1 },
        },
        fadeOut: {
            duration: 250,
            from: { opacity: 1 },
            to: { opacity: 0 },
        },
        slideUp: {
            duration: 300,
            from: { transform: [{ translateY: 20 }], opacity: 0 },
            to: { transform: [{ translateY: 0 }], opacity: 1 },
        },
        slideDown: {
            duration: 300,
            from: { transform: [{ translateY: -20 }], opacity: 0 },
            to: { transform: [{ translateY: 0 }], opacity: 1 },
        },
        scale: {
            duration: 200,
            from: { transform: [{ scale: 0.95 }] },
            to: { transform: [{ scale: 1 }] },
        },
    },
};

export default animations;
