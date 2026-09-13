# Asset sources and licenses

This project contains ten reference-guided character assemblies and six additional restaurant staff assemblies made in Blender. The supplied photograph is used only as an appearance reference for p01–p10. It is not projected onto a billboard or used as a face texture. Faces are generic parametric reconstructions; the characters are not scans or verified replicas of the photographed people. The six staff roles and uniforms are authored simulation designs, not inferred occupations of the photographed people.

## MakeHuman / MPFB core assets — CC0 1.0 Universal

The base human topology, UVs, 1,258 available morph targets, game-engine rig definitions and skin weights originate from the official MakeHuman Community / MPFB project. The installed MPFB version used for generation is 2.0.17; Blender is 4.5.8 LTS.

- Official repository: <https://github.com/makehumancommunity/mpfb2>
- License explanation: <https://github.com/makehumancommunity/mpfb2/blob/master/LICENSE.md>
- Complete asset license: <https://github.com/makehumancommunity/mpfb2/blob/master/LICENSE.ASSETS.md>
- Community license page: <https://static.makehumancommunity.org/about/license.html>

The project explicitly distinguishes source code from graphical assets. Core meshes, targets, textures, clothing, rigs, poses and related graphical data are CC0. The MPFB add-on's program code is GPL-3.0-or-later. This delivery does not bundle the MPFB add-on's program code; the rebuilding script calls an installed copy.

## Official system asset pack — CC0

Source: <https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html>

Download: <https://files2.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip>

Used or adapted assets include `male_elegantsuit01`, `male_casualsuit01`, `female_elegantsuit01`, `female_casualsuit01`, `shoes01`, `high-poly` eyes and eye material, `eyebrow001`, `eyelashes01`, and the `short01`–`short04` / `bob01` hair meshes. The official pack lists these assets as CC0 by `makehuman_system`.

Garment pieces are fitted to the generated body, separated into upper/lower parts where appropriate, given distinct colors, and in selected cases tailored to shorter sleeves. Eye alpha is preserved so the cornea reveals the iris and sclera.

## Natural skin packs — CC0

- Female pack: <https://static.makehumancommunity.org/assets/assetpacks/skins01.html>
- Male pack: <https://static.makehumancommunity.org/assets/assetpacks/skins02.html>

Used skin sources are `bobby_03_young_female_hairless` by **bobby_03**; `toigo_light_skin_with_natural_makeup`, `toigo_light_skin_male_freckles` and `toigo_light_skin_male_bronze` by **Margaret Toigo**; and `onlytheghosts_middle_aged_eurasian_female` by **OnlyTheGhosts**. Each is explicitly listed as CC0 in its official pack. Texture resolutions are reduced for interactive delivery.

## Additional clothing and hair — CC0

- Shoes pack: <https://static.makehumancommunity.org/assets/assetpacks/shoes01.html>
- Shirts pack: <https://static.makehumancommunity.org/assets/assetpacks/shirts01.html>
- Hair pack: <https://static.makehumancommunity.org/assets/assetpacks/hair01.html>

Selected sources: `toigo_ballet_flats`, `toigo_ankle_boots_female`, `toigo_fisherman_sweater`, `toigo_curled_under_bob` and `toigo_blunt_bob_with_bangs` by **Margaret Toigo**; `culturalibre_heroine_boots_4` by **culturalibre**; `rehmanpolanski_hair_bun_brown` by **RehmanPolanski**; and `o4saken_long01` by **punkduck**. The source pack pages explicitly label these as CC0. Added sleeve cuffs, heel pieces, handbag geometry, scene lighting and animation curves are authored for this project. The boots' missing optional source color image is replaced with a solid burgundy material.

The supplied `.blend` packs its used textures. The `.glb` files embed geometry, materials, skin weights and motion clips. Neither requires the original asset downloads for viewing. The original ten-person procedural generation uses Blender, MPFB and the source asset packs staged under `work/human-assets`; the staff rebuild reuses the packed existing project, as described below.

The procedural actions are authored kinematic demonstrations and are not measurements, motion capture, or biomechanics validation. Estimated heights, body proportions and outfits are intended for visual interaction.

## Restaurant staff expansion — existing CC0 bases and project-authored geometry

The expansion adds p11 head chef, p12 hot-line chef, p13 preparation chef, p14 and p15 floor service staff, and p16 food runner. The combined model contract contains 16 people, 53 bones and 27 landmarks per person: 848 bones and 432 landmarks. Every staff model retains the five Idle / Walk / Run / Wave / Sit motion interfaces. These counts describe the model interface; final model checks are recorded separately in `VALIDATION.md` and `examples/staff-validation/models-validation.json`.

No new external asset collection was introduced for this expansion. The male body and rig source for p11, p13, p14 and p16 is the existing p04 character; p12 and p15 reuse the existing p03 female body and rig. Existing p02 and p09 hair assets are reused for staff hairstyle variations. These bases, skin materials and existing hair inherit the MakeHuman / MPFB and pack source attributions above; the addon program itself is not bundled.

Staff-specific chef hat crowns and bands, double-breasted jacket fronts and buttons, standing collars, aprons, patch pockets, seams, belts, rear bows, the p14 waistcoat and tie, and service badges are actual meshes authored in Blender for this project. Materials and garment skin weights are adapted for skeletal animation. They are not photographic cutouts, downloaded scans, or another vendor's staff model pack. Source body proportions and garments remain approximate designs; a chef or service label is a simulation role.

`blender/build_staff.py`, `blender/human_animations.py` and `blender/glb_sampler.py` rebuild the staff from the delivered packed project, without downloading new source packs or requiring MPFB to be installed. The combined download is `public/assets/human-layer.blend`; `public/assets/staff-models.blend` contains the six staff separately. Rebuild details and coordinate conventions are in `blender/README.md`.

The restaurant environment and its Bistro CC BY 4.0 / existing CC0 equipment attributions are unchanged by adding personnel; see `SCENE_ATTRIBUTION.md`. Worker positions and headings are project-authored scene configuration based on the existing equipment and walkable floor. The two floor modules remain separate, and the additional collision proxies do not alter the source restaurant geometry.

## Review language analysis in v7

The user explicitly authorized academic research use of the authors' SCLIWC2024 dictionary. The dictionary is kept outside this application and delivery archive. The application contains derived per-review counts, category labels, method/version information and hashes only; it does not redistribute the restricted dictionary or matched dictionary entries. Author source and usage terms: https://github.com/Cui-xt/textmind . This independent counting pipeline is not the official LIWC22 application or TextMind desktop software.

The existing review corpus contains Trip.com / 携程 restaurant response text, separately attributed from the earlier `yf_dianping` notebook fragments. Source URLs and text completeness are retained per record. No ownership of review content or measured reviewer personality is claimed. OpenCC and jieba are optional local preprocessing dependencies; their packages and conversion/segmentation dictionaries are not bundled in the web application. The browser displays precomputed results.

## v10 anatomical muscle atlas — Z-Anatomy / BodyParts3D, CC BY-SA 4.0

`public/assets/anatomy-v10/` contains real independent anatomical surface meshes extracted and organized in Blender from the official [Z-Anatomy repository](https://github.com/Z-Anatomy/Models-of-human-anatomy), pinned to commit `3e343336567a817ec6bdd77132ecf9672570bde7`. The upstream `Z-Anatomy.zip` SHA-256 is `e029688545627bd0214b269e1063143abb580aad72b2c2445d6d8a9a0d9da736`. The derived GLBs, Blender project and associated anatomical catalog are distributed under **Creative Commons Attribution-ShareAlike 4.0 International**, following the [upstream license and attribution requirements](https://github.com/Z-Anatomy/Models-of-human-anatomy/blob/3e343336567a817ec6bdd77132ecf9672570bde7/License.txt).

Required source attributions are retained:

- **BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan**
- **Z-Anatomy - The libre 3D atlas of anatomy - CC-BY-SA 4.0**

Contributors include Kousaku Okubo (original BodyParts3D), Gauthier Kervyn (3D design and anatomy), and Marcin Zielinski (Blender tools). Project adaptations are extraction of independently named source muscle and related tissue surfaces, coordinate normalization, evaluation of source-authored surface modifiers, red/ivory display colors preserving original muscle/tendon face partitions, translated navigation labels, source attachment indexing, and WebGL export. The original muscle topology is also preserved in a hidden collection of `anatomy-muscles.blend`; no ellipsoid or generated spindle substitutes for these structures. The atlas consists of 509 muscle-related source objects (including bilateral structures, muscle heads and connective tissues), plus separate source attachment surfaces and a neutral skeleton reference. These object counts are not a count of distinct human muscles.

Only muscle-related structures, their bone references and source muscle attachment patches are included. The inner-ear and kidney assets separately listed under noncommercial licenses in the upstream attribution file are excluded, as are other organs, encyclopedia definitions and application-template Python. Original upstream attribution is in `UPSTREAM_LICENSE.txt`; full provenance, modification notes, precision boundaries and source hashes are in [SOURCE_AND_LICENSE.md](public/assets/anatomy-v10/SOURCE_AND_LICENSE.md) and `source-lock.json`.

The [current BodyParts3D original-database license](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html) changed to CC BY 4.0 on 2025-02-27. This release uses the Z-Anatomy adaptation, keeps its CC BY-SA 4.0 license and required historic attribution, and does not relicense the adaptation based on that later change.

This standard anatomical atlas is separate from the 16 CC0-based characters. It is not an individual medical reconstruction, microscopic fiber reconstruction, muscle activation model or force simulation, and it is not retargeted to the character animation rigs. The v9 project-authored muscle schematic remains identified as historical schematic material; it is not the source of the v10 atlas.


## v12 IRON 外观参考研究模型

`public/assets/iron-training/` 与 `blender/iron-training/` 中的机器人由本项目在 Blender 中原创程序建模，外观参考用户提供的两张 XPENG IRON 照片；照片本身不随此目录复制。白色表面法线纹理由脚本生成。该模型及运动参数不代表 XPENG 官方 CAD、URDF、标定规格或授权合作；18 节点研究骨架与动作由本项目编排。详见同目录 manifest.json、Blender 建模脚本与验证报告。

## v12.1 智元 D1 外观参考模型

`public/assets/d1-social/` 与 `blender/d1-social/` 中的 D1 网格、材质、13 个骨骼控制节点、蒙皮与四组演示动作由本项目在 Blender 中制作，外观参考用户在本次修改任务中提供的产品图片。白色机身、前置相机、金属髋关节、格构小腿与黄色足垫均为实际三维几何。参考图片的摄影和产品设计权利归原权利人，项目未将其作为原创渲染图。

模型高度按智元官方 D1 Pro / Edu 页面所列的约 420 mm 进行整体缩放；其他比例、关节与相机位置属于外观建模设定，未使用原厂 CAD、URDF 或实机标定数据。`d1-preview.png` 是模型的实际 Blender 渲染。此资产用于场景交互与专家示范，不包含策略训练或实机动力学验证。详细来源、官方页面与使用说明见 `public/assets/d1-social/SOURCE_AND_LICENSE.md`。
