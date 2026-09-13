# 动作姿态编辑与肌肉示意

动作库可切换实体、骨骼、关键节点和肌肉示意。骨骼模式直接显示已交付 GLB 的 53 个骨骼节点；关键点模式显示原有的 27 个骨骼附着标记。点击三维节点或从列表选择后，动画自动暂停。可以输入 X / Y / Z 偏移，或拖动选中节点的彩色坐标轴；播放仍叠加当前偏移。

“撤销 / 重做”保留当前人物、当前动作的编辑历史。“恢复原始”清空当前预览的两层偏移；点击保存才同步到场景。“保存当前人物 / 动作”将偏移写入本机。切换人物或动作会载入该组合已保存的偏移，未保存编辑不会修改原始 GLB。应用当前动作到场景时，会先保存当前尚未保存的偏移；动画、模型和原始 Blender 工程都不被覆盖。

骨骼位移每轴限制 ±0.080 m，手指骨骼 ±0.025 m，关键点 ±0.100 m。根骨 `Root` 的位移交给场景导航，不从姿态编辑器移动。这里的限幅用于控制编辑范围，不是人体关节生理约束。编辑骨盆、腿或手臂可能改变既有的接触关系，需要在场景中复核坐垫、桌面和道具位置。采集或回放期间可浏览显示模式，但编辑和保存被锁定。

## 坐标与播放顺序

- `boneOffsets` 是骨骼父节点局部坐标系中的位置增量，单位为 GLB 模型局部米。它在原始动画采样后加到 `bone.position`，会带动子骨和蒙皮。
- `keypointOffsets` 是关键点所附骨骼局部坐标系中的附加位置，叠加到 `keypoints.json` 的原始 `offset`，只调整标记，不改变人体形状。
- 三维拖动坐标轴显示世界 X / Y / Z；系统将世界位置反变换到对应父骨或附着骨的局部坐标后保存。
- 每次重新采样前恢复未加偏移的位置，之后执行 AnimationMixer，再叠加当前偏移。暂停、循环、跳转或倒放均不会反复累积增量。
- 关键点显示、导出、眼部中心应调用场景的统一修正坐标接口。

## 保存与接入

本机键为 `mindspace.pose-overrides.v1.<sceneId>`，可由宿主再次使用分场景 storage 包装。餐厅配置副本共享原始几何，但拥有独立姿态设置。JSON 导出包括当前场景保存的所有组合，另以 `draft` 单独注明尚未保存的当前编辑；导出本身不保存。

```json
{
  "schema": "human-pose-overrides-v1",
  "sceneId": "restaurant",
  "revision": 1,
  "entries": [{
    "actorId": "p01",
    "clip": "idle",
    "boneOffsets": {"hand_r": [0.02, 0, 0]},
    "keypointOffsets": {"nose": [0, 0, 0.01]}
  }]
}
```

`clip` 使用实际剪辑的规范小写名称，如 `readmenu`、`wipetable`、`seatedtalk`，不是场景高层动作别名。空偏移不占用保存条目。损坏或超限数据不会覆盖当前设置，保存失败会明确显示失败。

- `ActivityLibraries({sceneContext,storage,poseStore?,onPoseChange})`：初始化与保存后通知当前完整 snapshot；`getPoseSnapshot()` 返回保存内容。
- `HumanScene.setPoseOverrides(snapshot,{temporary:false})`：设置场景使用的配置并重新采样当前画面。
- `setPoseOverrides(recordedSnapshot,{temporary:true})`：回放临时替换，不写配置或本机存储。对没有记录偏移的旧采集传 `null`，表示回放原始姿态。
- `clearTemporaryPoseOverrides()`：结束回放后恢复当前配置。
- `getPoseSnapshot()`：返回当前有效配置，供采集 metadata 保存。
- `getKeypointOffset(actorId,clip,pointId)`：返回关键点附加偏移。
- `getLandmarkWorldPosition(actorId,landmark,target?)`：按当前实际剪辑，返回包含骨骼和关键点修正的世界坐标。

宿主在 episode metadata 的 `libraries.poseOverrides` 保存完整快照，并在回放进入 / 退出时分别调用临时应用 / 恢复接口。设置按场景隔离；角色切换不应更换其他人物的偏移。

## Blender 肌肉示意

本次实际使用 Blender 4.5.8 检查 `human-layer.blend`：16 个骨架，每个 53 根骨骼，工程内没有原有肌肉系统。`public/assets/pose-v9/muscle-inspection.json` 保存检查结果。新增的 `muscle-schematic.blend` 与 `muscle-schematic.glb` 是在 Blender 创建的梭形网格；浏览器根据当前动画骨骼端点放置 20 个主要肌群示意，包括上臂、前臂、大腿、小腿、胸、腹与背部。

该覆盖明确标为“肌肉示意”，只是随骨骼更新的三维结构视图，不计算肌肉激活、肌力、生理反应、软组织或碰撞，也不声称解剖尺寸经过测量。不同身高和动作依附同一套示意映射，不能替代生物力学模型。

可复现构建：

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b --python blender/v9-pose-tools/build_muscle_schematic.py -- --source public/assets/human-layer.blend --out public/assets/pose-v9
```

## 验证

`tests/pose-tools-v9.test.mjs` 检查分场景保存、超限 / 无效数据、动画采样无累积、关键点与骨骼偏移分离、实际预览与场景采样一致、回放临时应用恢复、世界拖动到局部的转换、撤销恢复及真实 Blender GLB 的轴向。浏览器验收另覆盖实际节点点击、TransformControls 鼠标拖动、播放暂停、保存刷新、导出与肌肉示意截图。
