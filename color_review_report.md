# Color Review Report: index.css vs Figma Designs

This report evaluates the colors defined in `index.css` against the colors extracted from the Figma project.

## 1. Structure Issues in `index.css`

### ⚠️ Duplicate Overrides in `:root`

The following variables are defined multiple times in `:root`. The last definition overrides the previous ones:

- **--background**: Previously `1 0 0` (#FFFFFF), overridden by `0.991 0.001 106.423` (#FCFCFB).
- **--card**: Previously `1 0 0` (#FFFFFF), overridden by `1 0 0` (#FFFFFF).
- **--border**: Previously `0.922 0 0` (#E5E5E5), overridden by `0.929 0.013 255.508` (#E2E8F0).
- **--card-foreground**: Previously `0.145 0 0` (#0A0A0A), overridden by `0.13 0.043 265.132` (#020618).
- **--destructive**: Previously `0.577 0.245 27.325` (#E7000B), overridden by `0.584 0.239 28.474` (#E7000B).
- **--foreground**: Previously `0.145 0 0` (#0A0A0A), overridden by `0.13 0.043 265.132` (#020618).
- **--accent**: Previously `0.97 0 0` (#F5F5F5), overridden by `0.968 0.007 247.896` (#F1F5F9).
- **--muted**: Previously `0.97 0 0` (#F5F5F5), overridden by `0.968 0.007 247.896` (#F1F5F9).
- **--primary**: Previously `0.205 0 0` (#171717), overridden by `0.547 0.246 262.866` (#155DFC).
- **--muted-foreground**: Previously `0.556 0 0` (#737373), overridden by `0.554 0.046 257.526` (#62748E).
- **--primary-foreground**: Previously `0.985 0 0` (#FAFAFA), overridden by `0.984 0.003 247.858` (#F8FAFC).
- **--accent-foreground**: Previously `0.205 0 0` (#171717), overridden by `0.208 0.042 266.359` (#0F172B).
- **--primary-second**: Previously `0.205 0 0` (#171717), overridden by `0.966 0.016 262.753` (#EEF4FF).

### 🚨 Dark Mode Overrides in `.dark` (CRITICAL BUG)

The following dark mode variables are overridden by **light mode values** because the custom light mode block was copy-pasted at the bottom of the `.dark` selector block:

- **--background**: Intended dark value `0.145 0 0` (#0A0A0A) is overridden by light value `0.991 0.001 106.423` (#FCFCFB).
- **--card**: Intended dark value `0.205 0 0` (#171717) is overridden by light value `1 0 0` (#FFFFFF).
- **--border**: Intended dark value `1 0 0` (#FFFFFF) is overridden by light value `0.929 0.013 255.508` (#E2E8F0).
- **--card-foreground**: Intended dark value `0.985 0 0` (#FAFAFA) is overridden by light value `0.13 0.043 265.132` (#020618).
- **--destructive**: Intended dark value `0.704 0.191 22.216` (#FF6467) is overridden by light value `0.584 0.239 28.474` (#E7000B).
- **--foreground**: Intended dark value `0.985 0 0` (#FAFAFA) is overridden by light value `0.13 0.043 265.132` (#020618).
- **--accent**: Intended dark value `0.269 0 0` (#262626) is overridden by light value `0.968 0.007 247.896` (#F1F5F9).
- **--muted**: Intended dark value `0.269 0 0` (#262626) is overridden by light value `0.968 0.007 247.896` (#F1F5F9).
- **--primary**: Intended dark value `0.922 0 0` (#E5E5E5) is overridden by light value `0.547 0.246 262.866` (#155DFC).
- **--muted-foreground**: Intended dark value `0.708 0 0` (#A1A1A1) is overridden by light value `0.554 0.046 257.526` (#62748E).
- **--primary-foreground**: Intended dark value `0.205 0 0` (#171717) is overridden by light value `0.984 0.003 247.858` (#F8FAFC).
- **--accent-foreground**: Intended dark value `0.985 0 0` (#FAFAFA) is overridden by light value `0.208 0.042 266.359` (#0F172B).
- **--primary-second**: Intended dark value `0.205 0 0` (#171717) is overridden by light value `0.966 0.016 262.753` (#EEF4FF).

## 2. Color Matching Analysis (Light Mode/Effective Colors)

Here is how the effective light-mode colors defined in `:root` match the colors used in Figma nodes:

| CSS Variable                   | OKLCH Value           | Converted Hex | Figma Status | Matches Node / Style in Figma                                                    |
| ------------------------------ | --------------------- | ------------- | ------------ | -------------------------------------------------------------------------------- |
| `--background`                 | `0.991 0.001 106.423` | `#FCFCFB`     | ✅ Match     | Nodes: Rectangle 2, Language Select Page - Desktop, Language Select Page - phone |
| `--foreground`                 | `0.13 0.043 265.132`  | `#020618`     | ✅ Match     | Nodes: Rectangle 1, Rectangle 2, CodeStep                                        |
| `--card`                       | `1 0 0`               | `#FFFFFF`     | ✅ Match     | Nodes: phone, desktop, primary-btn                                               |
| `--card-foreground`            | `0.13 0.043 265.132`  | `#020618`     | ✅ Match     | Nodes: Rectangle 1, Rectangle 2, CodeStep                                        |
| `--popover`                    | `1 0 0`               | `#FFFFFF`     | ✅ Match     | Nodes: phone, desktop, primary-btn                                               |
| `--popover-foreground`         | `0.145 0 0`           | `#0A0A0A`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--primary`                    | `0.547 0.246 262.866` | `#155DFC`     | ✅ Match     | Nodes: Rectangle 2, SUBMIT, Background+Shadow                                    |
| `--primary-foreground`         | `0.984 0.003 247.858` | `#F8FAFC`     | ✅ Match     | Nodes: SUBMIT, Rectangle 2, Sign Up Page - Mobile                                |
| `--secondary`                  | `0.97 0 0`            | `#F5F5F5`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--secondary-foreground`       | `0.205 0 0`           | `#171717`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--muted`                      | `0.968 0.007 247.896` | `#F1F5F9`     | ✅ Match     | Nodes: Rectangle 2, Background+Border, Card 3: Locked                            |
| `--muted-foreground`           | `0.554 0.046 257.526` | `#62748E`     | ✅ Match     | Nodes: Rectangle 2, Min. 8 Characters, you@example.com                           |
| `--accent`                     | `0.968 0.007 247.896` | `#F1F5F9`     | ✅ Match     | Nodes: Rectangle 2, Background+Border, Card 3: Locked                            |
| `--accent-foreground`          | `0.208 0.042 266.359` | `#0F172B`     | ✅ Match     | Nodes: Rectangle 2, IPHONE_SCREEN                                                |
| `--destructive`                | `0.584 0.239 28.474`  | `#E7000B`     | ✅ Match     | Nodes: Rectangle 2, IPHONE_SCREEN, LS–PC Drag & Drop                             |
| `--border`                     | `0.929 0.013 255.508` | `#E2E8F0`     | ✅ Match     | Nodes: Rectangle 2, Background, Vertical Divider                                 |
| `--input`                      | `0.922 0 0`           | `#E5E5E5`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--ring`                       | `0.708 0 0`           | `#A1A1A1`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--chart-1`                    | `0.87 0 0`            | `#D4D4D4`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--chart-2`                    | `0.556 0 0`           | `#737373`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--chart-3`                    | `0.439 0 0`           | `#525252`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--chart-4`                    | `0.371 0 0`           | `#404040`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--chart-5`                    | `0.269 0 0`           | `#262626`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--sidebar`                    | `0.985 0 0`           | `#FAFAFA`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--sidebar-foreground`         | `0.145 0 0`           | `#0A0A0A`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--sidebar-primary`            | `0.205 0 0`           | `#171717`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--sidebar-primary-foreground` | `0.985 0 0`           | `#FAFAFA`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--sidebar-accent`             | `0.97 0 0`            | `#F5F5F5`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--sidebar-accent-foreground`  | `0.205 0 0`           | `#171717`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--sidebar-border`             | `0.922 0 0`           | `#E5E5E5`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--sidebar-ring`               | `0.708 0 0`           | `#A1A1A1`     | ❌ Mismatch  | Not found in Figma                                                               |
| `--primary-second`             | `0.966 0.016 262.753` | `#EEF4FF`     | ✅ Match     | Nodes: Rectangle 3, Rectangle 2, Benefits                                        |
| `--codeblock`                  | `0.257 0.03 267.456`  | `#1D2332`     | ✅ Match     | Nodes: Rectangle 1, Rectangle 20, chat-hdr                                       |
| `--codeblock-foreground`       | `0.845 0 0`           | `#CCCCCC`     | ✅ Match     | Nodes: Rectangle 2, while condition: # code runs here                            |
| `--success`                    | `0.631 0.101 183.848` | `#2A9D90`     | ✅ Match     | Nodes: Rectangle 2, Overlay, Icon                                                |
| `--destructive-foreground`     | `0.984 0.003 247.858` | `#F8FAFC`     | ✅ Match     | Nodes: SUBMIT, Rectangle 2, Sign Up Page - Mobile                                |
| `--primary-second-border`      | `0.878 0.059 269.354` | `#C7D6FF`     | ✅ Match     | Nodes: Rectangle 5, Rectangle 2, i                                               |
| `--primary-second-foreground`  | `0.288 0.051 264.576` | `#1E2A44`     | ✅ Match     | Nodes: Rectangle 4, Rectangle 2, for i in range(3):                              |
| `--red-patel`                  | `0.617 0.222 26.72`   | `#ED3232`     | ✅ Match     | Nodes: Ellipse, Rectangle 2                                                      |
| `--yellow-patel`               | `0.761 0.171 61.964`  | `#FC9415`     | ✅ Match     | Nodes: Ellipse, Rectangle 2, Learn                                               |
| `--green-patel`                | `0.729 0.194 147.514` | `#33C759`     | ✅ Match     | Nodes: Ellipse, Rectangle 2, star                                                |
| `--trueaccent`                 | `0.953 0.022 272.058` | `#EAEFFF`     | ✅ Match     | Nodes: Rectangle 2, block-row-1, Continue Lesson                                 |
| `--dark-gray`                  | `0.846 0.022 271.157` | `#C7CCDB`     | ✅ Match     | Nodes: Rectangle 2, Background, Code                                             |
| `--hint-yellow`                | `0.974 0.02 74.665`   | `#FFF5E8`     | ✅ Match     | Nodes: Rectangle 2, Hint Panel, Hint Panel mobile                                |
| `--codeblock-header`           | `0.208 0.031 269.49`  | `#121726`     | ✅ Match     | Nodes: Rectangle 2, cb-hdr                                                       |
| `--brown`                      | `0.486 0.112 59.823`  | `#8C4D05`     | ✅ Match     | Nodes: Rectangle 2, 💡 Hints                                                     |
| `--glowblue`                   | `0.916 0.041 256.241` | `#D2E5FF`     | ✅ Match     | Nodes: Rectangle 2, slot-0                                                       |
| `--medium-gray`                | `0.982 0.008 271.33`  | `#F7F9FF`     | ✅ Match     | Nodes: Rectangle 2, Drop Zone, Chat Window                                       |
| `--green-mint`                 | `0.918 0.065 160.789` | `#BFF2D6`     | ✅ Match     | Nodes: Rectangle 2, Background, user-a2-correct                                  |
| `--red-mint`                   | `0.89 0.058 18.3`     | `#FFCCCC`     | ✅ Match     | Nodes: Rectangle 2                                                               |
| `--pink`                       | `0.963 0.018 17.478`  | `#FFEEEE`     | ✅ Match     | Nodes: Rectangle 2, Wrong mobile, Wrong                                          |
| `--darker-gray`                | `0.554 0.041 257.417` | `#64748B`     | ✅ Match     | Nodes: Rectangle 2, Start learning — it's free, label mail                       |
| `--yellow-medium`              | `0.917 0.061 69.313`  | `#FFDDB8`     | ✅ Match     | Nodes: Rectangle 2, Background                                                   |
| `--green-foreground`           | `0.484 0.106 162.63`  | `#00714D`     | ✅ Match     | Nodes: Rectangle 2, AI explanations, Spaced repetition                           |
| `--red-foreground`             | `0.417 0.17 27.379`   | `#93000A`     | ✅ Match     | Nodes: Rectangle 2, HARD                                                         |
| `--bluedark`                   | `0.208 0.04 265.755`  | `#0F172A`     | ✅ Match     | Nodes: Rectangle 2, Left brand panel, Choose your language                       |
| `--bluelight`                  | `0.809 0.096 251.813` | `#93C5FD`     | ✅ Match     | Nodes: Rectangle 2, ic-1, ic-2                                                   |
| `--borderblack`                | `0.224 0.016 274.047` | `#191B23`     | ✅ Match     | Nodes: Rectangle 2, Loop, Your Roadmap                                           |
| `--purple-cpp`                 | `0.486 0.223 277.63`  | `#4B3FD8`     | ✅ Match     | Nodes: Rectangle 2, STRENGTHS, Text                                              |
| `--orange-jv`                  | `0.669 0.173 43.881`  | `#E86A2B`     | ✅ Match     | Nodes: Rectangle 2, STRENGTHS, Clean OOP                                         |
| `--purple-jv-background`       | `0.934 0.034 289.404` | `#E8E6FF`     | ✅ Match     | Nodes: Rectangle 2, Background+Border, Background                                |
| `--orange-jv-background`       | `0.97 0.019 67.603`   | `#FEF3E8`     | ✅ Match     | Nodes: Rectangle 2, Background+Border, Background                                |
