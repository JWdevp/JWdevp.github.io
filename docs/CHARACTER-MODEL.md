# Making the 3D character

The hero renders whatever you put at **`public/models/character.glb`**. Until
that file exists it falls back to a stand-in built from primitives. This
document is about replacing it with a real model of you.

Before anything else, the shortcut: whenever you have a candidate file, run

```bash
npm run check:model -- path/to/your.glb
```

It reads the file and tells you, in plain terms, whether the greeting will play,
whether the pointer tracking will find a head, and whether the file is too heavy.
Use it after every export — it takes a second and saves a lot of guessing.

---

## What the code actually needs

Three things, in order of importance:

| # | Requirement | If it's missing |
| --- | --- | --- |
| 1 | A bone named **`Head`** | Tracking does nothing. This is the only hard requirement. |
| 2 | Bones named `Neck`, `Spine`/`Chest`, `LeftEye`/`RightEye` | Those layers are skipped; the rest still works. |
| 3 | Animation clips named **`Greeting`** and **`Idle`** | No wave, no breathing — but the model still loads and tracks. |

Name matching ignores case, `mixamorig:` prefixes, dots, underscores and
hyphens, so `mixamorig:Head`, `head_01` and `DEF-head` all match. The full list
of accepted names is `BONE_CANDIDATES` in
`src/components/Character/bones.ts` — add yours there if your rig uses something
exotic.

**You do not need to worry about scale or position.** The loader measures the
model, finds the head, and crops to a head-and-shoulders bust automatically. A
1.7-metre avatar and a 0.05-unit sculpt both end up framed the same way.

Keep the file **under about 6 MB**. It loads on first paint.

---

## Route A — Ready Player Me + Blender (recommended)

Free, about an hour the first time, and it produces exactly the rig this project
was written against: the bones are named `Head`, `Neck`, `Spine`, `LeftEye`,
`RightEye`, so eye tracking works — which is the part that makes the character
feel alive.

### 1. Make the avatar from a photo

1. Go to **[readyplayer.me](https://readyplayer.me)** and create an avatar.
2. Choose **Full body** (you want arms, for the wave).
3. Upload a selfie — front-facing, neutral expression, good light. It generates
   a stylised likeness; then adjust hair, beard, glasses and skin tone by hand
   until it looks like you. Budget most of your time here.
4. Download the `.glb`.

Optional, for a smaller file: the download is a URL ending in `.glb`. Append
`?quality=medium&textureAtlas=1024&meshLod=1` to it and download that instead.

At this point you have a model but **no animations**. Run
`npm run check:model -- ~/Downloads/avatar.glb` — it should report the head, neck,
torso and eye bones, and note that there are no clips.

### 2. Get a wave and an idle from Mixamo

[Mixamo](https://www.mixamo.com) is free with an Adobe account and has both
animations. It only accepts FBX/OBJ uploads, so:

1. Open **Blender** (free, [blender.org](https://blender.org)).
2. `File → Import → glTF 2.0`, pick your avatar.
3. `File → Export → FBX`. Under *Include*, tick **Armature** and **Mesh**.
4. On Mixamo, **Upload Character** and give it that FBX. It will auto-rig.
5. Search **"Waving"**, then **"Breathing Idle"**. For each: *Download* →
   Format **FBX**, Skin **Without Skin**, Frames 30.

You now have `avatar.glb`, `Waving.fbx` and `Breathing Idle.fbx`.

### 3. Combine them in Blender and export

1. New Blender scene. Import the original **`.glb`** (not the FBX — it keeps the
   good materials and the eye bones).
2. `File → Import → FBX` for `Waving.fbx`. It arrives as a second armature with
   an Action on it.
3. Open the **Dope Sheet → Action Editor**. Select your avatar's armature,
   then assign the imported action to it from the action dropdown.
   - If the bone names don't line up, install the free **Rokoko Retargeting**
     add-on and retarget source → target. This is the fiddliest step in the whole
     process; the Rokoko add-on does it in about four clicks.
4. Rename the action to exactly **`Greeting`**.
5. Repeat for the idle, renamed to **`Idle`**.
6. For each action, click the **shield icon** (Fake User) next to its name.
   Without this, Blender discards unused actions on export and you end up with
   an animation-less GLB — a common and confusing failure.
7. Delete the leftover imported armatures.
8. `File → Export → glTF 2.0 (.glb)`:
   - Format: **glTF Binary (.glb)**
   - *Animation* → **Animations: ✓**, **Actions: Export all actions**
   - *Data → Mesh* → leave defaults
9. Save it as `public/models/character.glb` in this project.

### 4. Check and load

```bash
npm run check:model
npm run dev
```

The console also prints what it found on load, e.g.
`[character] clips: Greeting, Idle` and `[character] bones: head=Head …`.

---

## Route B — Mixamo only (faster, no eye tracking)

If the retargeting in Route A defeats you, this is the pragmatic fallback. You
lose the eye bones, so the gaze is carried by the head and neck alone. It still
reads well.

1. Make the avatar in Ready Player Me and export to FBX via Blender (steps 1–3
   above).
2. Upload to Mixamo, then download **Waving** and **Breathing Idle**
   *with* skin, as FBX.
3. In Blender: import both, keep one mesh, rename the two actions to `Greeting`
   and `Idle`, tick Fake User on both, export as GLB.

Mixamo's auto-rig produces `mixamorig:Head`, `mixamorig:Neck` and
`mixamorig:Spine` — all recognised.

---

## Route C — image-to-3D generators

Tools like **Meshy**, **Tripo3D** or **Luma** turn a photo into a mesh. They are
tempting and they are the wrong starting point here: the output is a single
unrigged blob, so `npm run check:model` will tell you there is no head bone and
nothing will move. To use one you would still have to auto-rig it in Mixamo,
which works far better on a clean humanoid like a Ready Player Me avatar than on
a generated sculpt.

Worth trying only if you want a stylised bust and are willing to rig it yourself.

---

## Route D — commission it

A rigged, animated stylised bust runs roughly €50–200 on Fiverr, ArtStation or
Blender Market. Give the artist this spec:

> glTF Binary (`.glb`), under 6 MB. Humanoid rig with bones named `Head`,
> `Neck`, `Spine`, `LeftEye`, `RightEye`. Two baked animation clips named exactly
> `Greeting` (a one-shot wave, ~2 s) and `Idle` (a seamless loop, ~4 s).
> Character faces +Z. Head and shoulders must read well in isolation — it is
> cropped to a bust.

---

## When something looks wrong

| Symptom | Cause and fix |
| --- | --- |
| Character faces away from the cursor | Rig faces −Z. Set `yawSign: -1` in `characterConfig.ts`. |
| Looks up when the cursor goes down | Set `pitchSign: -1` in the same file. |
| Head too big or too small in frame | Adjust `FRAMING.headDiameter` in `characterConfig.ts`. |
| Head sits too low or too high | Adjust `FRAMING.headY`. |
| Loads but never moves | No clips, or the actions weren't exported — check Fake User, and re-run `npm run check:model`. |
| Waves forever / never waves | Clip name doesn't match. Rename to `Greeting` and `Idle`. |
| Neck twists unnaturally far | Lower `MAX_HEAD_ROTATION` / `MAX_NECK_ROTATION` in `characterConfig.ts`. |
| Nothing renders, placeholder stays | Wrong path or a corrupt file. It must be exactly `public/models/character.glb`. |
| Very slow on mobile | File too heavy. Re-export at 1024px textures, or run `npx @gltf-transform/cli optimize in.glb out.glb`. |

Everything tunable lives in **`src/components/Character/characterConfig.ts`** —
tracking amounts, damping, orientation and framing, each documented in place.
