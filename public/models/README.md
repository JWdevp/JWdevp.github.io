# 3D character model

Drop the rigged character here as **`character.glb`**:

```
public/models/character.glb
```

The app checks for the file at runtime. Until it exists, an abstract 3D
placeholder is shown — nothing breaks, and no error appears. As soon as the file
is present, it is loaded and animated automatically.

## What the model should contain

| Expected | Notes |
| --- | --- |
| A clip whose name contains `greet`, `wave`, `hello`, `hallo` or `salud` | Played once on arrival. |
| A clip whose name contains `idle`, `breath`, `stand` or `loop` | Played on a loop afterwards. |
| Bones named `Head`, `Neck`, `Spine`/`Chest`, `LeftEye`/`RightEye` (or `Eye_L`/`Eye_R`) | Used for pointer tracking. |

Matching is case-insensitive and tolerates `mixamorig:` prefixes, dots,
underscores and hyphens. Every one of these is optional: a model without eye
bones simply tracks with head and neck, and a model without a greeting clip
starts straight in idle.

To support different names, edit `BONE_CANDIDATES` in
`src/components/Character/bones.ts`, and the clip patterns at the bottom of the
same file.

Keep the file reasonably small (a few MB at most) — it is loaded on first paint.

## Checking a file before you use it

```bash
npm run check:model -- path/to/your.glb
```

It reports the clips, the bones it recognised and the file size, and says
whether the model is usable as-is.

## Making one

See **[`docs/CHARACTER-MODEL.md`](../../docs/CHARACTER-MODEL.md)** for the full
walkthrough: Ready Player Me for the likeness, Mixamo for the wave and the idle,
Blender to combine and export.

Scale and position are handled for you — the loader measures the model and crops
to a head-and-shoulders bust, so any avatar size works.
