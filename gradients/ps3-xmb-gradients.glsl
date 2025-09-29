// PS3 XMB Background Gradients - GLSL Functions
// Auto-generated on 2025-06-12T14:13:08.946Z

// January Night
vec3 getGradient_january_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0824, 0.0824, 0.0824), vec3(0.0980, 0.0980, 0.0980), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0980, 0.0980, 0.0980), vec3(0.3216, 0.3216, 0.3216), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.3216, 0.3216, 0.3216), vec3(0.3255, 0.3255, 0.3255), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.3255, 0.3255, 0.3255), vec3(0.6157, 0.6157, 0.6157), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.6157, 0.6157, 0.6157), vec3(0.7176, 0.7176, 0.7176), localT);
    } else {
        return vec3(0.7176, 0.7176, 0.7176);
    }
}

// February Night
vec3 getGradient_february_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0824, 0.0941, 0.0510), vec3(0.0941, 0.0980, 0.0667), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0941, 0.0980, 0.0667), vec3(0.3373, 0.3098, 0.2000), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.3373, 0.3098, 0.2000), vec3(0.3412, 0.3137, 0.2039), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.3412, 0.3137, 0.2039), vec3(0.6196, 0.5922, 0.3608), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.6196, 0.5922, 0.3608), vec3(0.7176, 0.6824, 0.4510), localT);
    } else {
        return vec3(0.7176, 0.6824, 0.4510);
    }
}

// March Night
vec3 getGradient_march_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0706, 0.0745, 0.0431), vec3(0.0745, 0.0863, 0.0549), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0745, 0.0863, 0.0549), vec3(0.2706, 0.2980, 0.1961), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.2706, 0.2980, 0.1961), vec3(0.2784, 0.3059, 0.2078), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.2784, 0.3059, 0.2078), vec3(0.5137, 0.5804, 0.3804), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.5137, 0.5804, 0.3804), vec3(0.5725, 0.6471, 0.4275), localT);
    } else {
        return vec3(0.5725, 0.6471, 0.4275);
    }
}

// April Night
vec3 getGradient_april_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0745, 0.0588, 0.0627), vec3(0.1294, 0.1098, 0.1176), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.1294, 0.1098, 0.1176), vec3(0.4275, 0.3412, 0.3529), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.4275, 0.3412, 0.3529), vec3(0.4275, 0.3412, 0.3569), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.4275, 0.3412, 0.3569), vec3(0.7176, 0.5882, 0.6157), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.7176, 0.5882, 0.6157), vec3(0.7922, 0.6549, 0.6784), localT);
    } else {
        return vec3(0.7922, 0.6549, 0.6784);
    }
}

// May Night
vec3 getGradient_may_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0627, 0.1373, 0.0510), vec3(0.0902, 0.1647, 0.0863), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0902, 0.1647, 0.0863), vec3(0.1098, 0.1961, 0.1098), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.1098, 0.1961, 0.1098), vec3(0.0980, 0.1725, 0.0941), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0980, 0.1725, 0.0941), vec3(0.1176, 0.2824, 0.1216), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.1176, 0.2824, 0.1216), vec3(0.1373, 0.2980, 0.1412), localT);
    } else {
        return vec3(0.1373, 0.2980, 0.1412);
    }
}

// June Night
vec3 getGradient_june_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0314, 0.0392, 0.0353), vec3(0.0941, 0.0824, 0.1059), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0941, 0.0824, 0.1059), vec3(0.3529, 0.2863, 0.4118), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.3529, 0.2863, 0.4118), vec3(0.3569, 0.2863, 0.4078), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.3569, 0.2863, 0.4078), vec3(0.6980, 0.5412, 0.7490), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.6980, 0.5412, 0.7490), vec3(0.7843, 0.6078, 0.8314), localT);
    } else {
        return vec3(0.7843, 0.6078, 0.8314);
    }
}

// July Night
vec3 getGradient_july_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0549, 0.0784, 0.0784), vec3(0.0706, 0.0980, 0.1020), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0706, 0.0980, 0.1020), vec3(0.0667, 0.2235, 0.2196), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0667, 0.2235, 0.2196), vec3(0.0588, 0.1961, 0.1843), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0588, 0.1961, 0.1843), vec3(0.0392, 0.3176, 0.3020), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0392, 0.3176, 0.3020), vec3(0.0549, 0.2980, 0.2863), localT);
    } else {
        return vec3(0.0549, 0.2980, 0.2863);
    }
}

// August Night
vec3 getGradient_august_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0000, 0.0078, 0.1059), vec3(0.0078, 0.0000, 0.1922), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0078, 0.0000, 0.1922), vec3(0.0039, 0.1686, 0.3686), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0039, 0.1686, 0.3686), vec3(0.0039, 0.2314, 0.3882), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0039, 0.2314, 0.3882), vec3(0.0118, 0.4980, 0.5765), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0118, 0.4980, 0.5765), vec3(0.0078, 0.5373, 0.6118), localT);
    } else {
        return vec3(0.0078, 0.5373, 0.6118);
    }
}

// September Night
vec3 getGradient_september_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0980, 0.0000, 0.1137), vec3(0.1216, 0.0000, 0.1529), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.1216, 0.0000, 0.1529), vec3(0.2235, 0.0000, 0.2706), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.2235, 0.0000, 0.2706), vec3(0.2549, 0.0000, 0.3098), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.2549, 0.0000, 0.3098), vec3(0.3765, 0.0000, 0.4902), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.3765, 0.0000, 0.4902), vec3(0.4157, 0.0039, 0.5608), localT);
    } else {
        return vec3(0.4157, 0.0039, 0.5608);
    }
}

// October Night
vec3 getGradient_october_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0275, 0.0000, 0.0118), vec3(0.0588, 0.0275, 0.0000), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0588, 0.0275, 0.0000), vec3(0.3333, 0.2000, 0.0000), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.3333, 0.2000, 0.0000), vec3(0.3412, 0.2078, 0.0000), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.3412, 0.2078, 0.0000), vec3(0.7294, 0.4706, 0.0196), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.7294, 0.4706, 0.0196), vec3(0.8353, 0.5765, 0.0039), localT);
    } else {
        return vec3(0.8353, 0.5765, 0.0039);
    }
}

// November Night
vec3 getGradient_november_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0824, 0.0627, 0.0510), vec3(0.1137, 0.0941, 0.0667), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.1137, 0.0941, 0.0667), vec3(0.2941, 0.2039, 0.0980), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.2941, 0.2039, 0.0980), vec3(0.2941, 0.2039, 0.0980), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.2941, 0.2039, 0.0980), vec3(0.4471, 0.2863, 0.1059), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.4471, 0.2863, 0.1059), vec3(0.4980, 0.3373, 0.1647), localT);
    } else {
        return vec3(0.4980, 0.3373, 0.1647);
    }
}

// December Night
vec3 getGradient_december_night(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0627, 0.0627, 0.0549), vec3(0.0627, 0.0510, 0.0392), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0627, 0.0510, 0.0392), vec3(0.2000, 0.1137, 0.0980), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.2000, 0.1137, 0.0980), vec3(0.1529, 0.0784, 0.0824), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.1529, 0.0784, 0.0824), vec3(0.2980, 0.1529, 0.1176), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.2980, 0.1529, 0.1176), vec3(0.2510, 0.1373, 0.1059), localT);
    } else {
        return vec3(0.2510, 0.1373, 0.1059);
    }
}

// January Day
vec3 getGradient_january_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.7216, 0.7216, 0.7216), vec3(0.8039, 0.8039, 0.8039), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8039, 0.8039, 0.8039), vec3(0.7569, 0.7569, 0.7569), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.7569, 0.7569, 0.7569), vec3(0.7098, 0.7098, 0.7098), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.7098, 0.7098, 0.7098), vec3(0.7608, 0.7608, 0.7608), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.7608, 0.7608, 0.7608), vec3(0.9020, 0.9020, 0.9020), localT);
    } else {
        return vec3(0.9020, 0.9020, 0.9020);
    }
}

// February Day
vec3 getGradient_february_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8353, 0.8667, 0.1961), vec3(0.8549, 0.8196, 0.1490), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8549, 0.8196, 0.1490), vec3(0.8078, 0.6627, 0.0667), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8078, 0.6627, 0.0667), vec3(0.7922, 0.6353, 0.0471), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.7922, 0.6353, 0.0471), vec3(0.8000, 0.6549, 0.0667), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8000, 0.6549, 0.0667), vec3(0.8196, 0.7490, 0.1294), localT);
    } else {
        return vec3(0.8196, 0.7490, 0.1294);
    }
}

// March Day
vec3 getGradient_march_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.3569, 0.6235, 0.0941), vec3(0.4471, 0.7176, 0.0902), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.4471, 0.7176, 0.0902), vec3(0.4353, 0.6784, 0.1020), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.4353, 0.6784, 0.1020), vec3(0.4157, 0.6667, 0.0980), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.4157, 0.6667, 0.0980), vec3(0.4863, 0.7412, 0.1373), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.4863, 0.7412, 0.1373), vec3(0.5059, 0.7529, 0.1608), localT);
    } else {
        return vec3(0.5059, 0.7529, 0.1608);
    }
}

// April Day

uniform sampler2D u_backgroundTexture;

vec3 getGradient_april_rgb(vec2 uv) {
    return texture2D(u_backgroundTexture, uv).rgb;
}
            

// May Day
vec3 getGradient_may_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0863, 0.5922, 0.0941), vec3(0.0824, 0.5608, 0.0863), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0824, 0.5608, 0.0863), vec3(0.0902, 0.5451, 0.0941), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0902, 0.5451, 0.0941), vec3(0.0824, 0.4941, 0.0863), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0824, 0.4941, 0.0863), vec3(0.0863, 0.4627, 0.0824), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0863, 0.4627, 0.0824), vec3(0.0706, 0.4235, 0.0784), localT);
    } else {
        return vec3(0.0706, 0.4235, 0.0784);
    }
}

// June Day
vec3 getGradient_june_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.5176, 0.3647, 0.8549), vec3(0.5373, 0.3686, 0.8471), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.5373, 0.3686, 0.8471), vec3(0.6275, 0.4157, 0.8627), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.6275, 0.4157, 0.8627), vec3(0.5804, 0.3804, 0.7922), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.5804, 0.3804, 0.7922), vec3(0.6235, 0.3647, 0.7137), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.6235, 0.3647, 0.7137), vec3(0.5686, 0.3255, 0.6196), localT);
    } else {
        return vec3(0.5686, 0.3255, 0.6196);
    }
}

// July Day
vec3 getGradient_july_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0510, 0.9098, 0.8941), vec3(0.0314, 0.8706, 0.8627), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0314, 0.8706, 0.8627), vec3(0.0196, 0.8235, 0.7922), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0196, 0.8235, 0.7922), vec3(0.0000, 0.7725, 0.7333), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0000, 0.7725, 0.7333), vec3(0.0000, 0.7255, 0.6353), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0000, 0.7255, 0.6353), vec3(0.0039, 0.6706, 0.5647), localT);
    } else {
        return vec3(0.0039, 0.6706, 0.5647);
    }
}

// August Day
vec3 getGradient_august_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0392, 0.6902, 0.8784), vec3(0.1020, 0.6863, 0.8510), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.1020, 0.6863, 0.8510), vec3(0.0392, 0.4549, 0.7255), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0392, 0.4549, 0.7255), vec3(0.0431, 0.3686, 0.7137), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0431, 0.3686, 0.7137), vec3(0.0000, 0.0745, 0.4196), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.0000, 0.0745, 0.4196), vec3(0.0000, 0.0275, 0.3098), localT);
    } else {
        return vec3(0.0000, 0.0275, 0.3098);
    }
}

// September Day
vec3 getGradient_september_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.6706, 0.2588, 0.7647), vec3(0.7137, 0.2706, 0.7922), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.7137, 0.2706, 0.7922), vec3(0.6824, 0.2431, 0.7373), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.6824, 0.2431, 0.7373), vec3(0.7255, 0.2824, 0.7686), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.7255, 0.2824, 0.7686), vec3(0.7255, 0.2941, 0.7686), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.7255, 0.2941, 0.7686), vec3(0.7922, 0.3647, 0.8627), localT);
    } else {
        return vec3(0.7922, 0.3647, 0.8627);
    }
}

// October Day
vec3 getGradient_october_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8902, 0.6980, 0.0902), vec3(0.8902, 0.6784, 0.0235), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8902, 0.6784, 0.0235), vec3(0.8824, 0.6392, 0.0314), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8824, 0.6392, 0.0314), vec3(0.8784, 0.6431, 0.0314), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8784, 0.6431, 0.0314), vec3(0.8824, 0.6588, 0.0471), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8824, 0.6588, 0.0471), vec3(0.8863, 0.6902, 0.0588), localT);
    } else {
        return vec3(0.8863, 0.6902, 0.0588);
    }
}

// November Day
vec3 getGradient_november_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.5961, 0.4510, 0.1765), vec3(0.5922, 0.4392, 0.1765), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.5922, 0.4392, 0.1765), vec3(0.5255, 0.3569, 0.1216), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.5255, 0.3569, 0.1216), vec3(0.5255, 0.3569, 0.1216), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.5255, 0.3569, 0.1216), vec3(0.4745, 0.2941, 0.0941), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.4745, 0.2941, 0.0941), vec3(0.4667, 0.2863, 0.0863), localT);
    } else {
        return vec3(0.4667, 0.2863, 0.0863);
    }
}

// December Day
vec3 getGradient_december_rgb(vec2 uv) {
    float t = dot(uv, vec2(-0.0000, 0.0000));
    t = clamp(t, 0.0, 1.0);

    if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8980, 0.2627, 0.1725), vec3(0.9059, 0.2627, 0.1647), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.9059, 0.2627, 0.1647), vec3(0.8941, 0.2588, 0.1765), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8941, 0.2588, 0.1765), vec3(0.8824, 0.2510, 0.1686), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8824, 0.2510, 0.1686), vec3(0.8784, 0.2549, 0.1725), localT);
    } else if (t <= 0.5000) {
        float localT = (t - 0.5000) / 0.0000;
        return mix(vec3(0.8784, 0.2549, 0.1725), vec3(0.8353, 0.2588, 0.1804), localT);
    } else {
        return vec3(0.8353, 0.2588, 0.1804);
    }
}

// Master gradient function
vec3 getPS3Gradient(vec2 uv, int month, int theme) {
    if (month == 0 && theme == 1) {
        return getGradient_january_night(uv);
    } else if (month == 1 && theme == 1) {
        return getGradient_february_night(uv);
    } else if (month == 2 && theme == 1) {
        return getGradient_march_night(uv);
    } else if (month == 3 && theme == 1) {
        return getGradient_april_night(uv);
    } else if (month == 4 && theme == 1) {
        return getGradient_may_night(uv);
    } else if (month == 5 && theme == 1) {
        return getGradient_june_night(uv);
    } else if (month == 6 && theme == 1) {
        return getGradient_july_night(uv);
    } else if (month == 7 && theme == 1) {
        return getGradient_august_night(uv);
    } else if (month == 8 && theme == 1) {
        return getGradient_september_night(uv);
    } else if (month == 9 && theme == 1) {
        return getGradient_october_night(uv);
    } else if (month == 10 && theme == 1) {
        return getGradient_november_night(uv);
    } else if (month == 11 && theme == 1) {
        return getGradient_december_night(uv);
    } else if (month == 0 && theme == 0) {
        return getGradient_january_rgb(uv);
    } else if (month == 1 && theme == 0) {
        return getGradient_february_rgb(uv);
    } else if (month == 2 && theme == 0) {
        return getGradient_march_rgb(uv);
    } else if (month == 3 && theme == 0) {
        return getGradient_april_rgb(uv);
    } else if (month == 4 && theme == 0) {
        return getGradient_may_rgb(uv);
    } else if (month == 5 && theme == 0) {
        return getGradient_june_rgb(uv);
    } else if (month == 6 && theme == 0) {
        return getGradient_july_rgb(uv);
    } else if (month == 7 && theme == 0) {
        return getGradient_august_rgb(uv);
    } else if (month == 8 && theme == 0) {
        return getGradient_september_rgb(uv);
    } else if (month == 9 && theme == 0) {
        return getGradient_october_rgb(uv);
    } else if (month == 10 && theme == 0) {
        return getGradient_november_rgb(uv);
    } else if (month == 11 && theme == 0) {
        return getGradient_december_rgb(uv);
    } else {
        return vec3(0.145, 0.349, 0.702); // Default PS3 blue
    }
}
