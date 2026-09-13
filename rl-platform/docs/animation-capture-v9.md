# v9 动画采样与历史回放

新采集帧的 `animationPose` 保存实际渲染器的动作状态。它独立于人物导航位置和 `metadata.libraries.poseOverrides`，用于保留动作切换期间的混合结果。当前骨骼动画仍是运动学演示，不是人体动力学测量。

`scene.getAnimationSnapshot()` 返回独立、可直接写入 JSONL 的对象：

```json
{
  "schema": "human-animation-pose-v1",
  "actors": {
    "p01": {
      "active": "idle",
      "clips": {
        "idle": {
          "clipName": "Idle",
          "duration": 2,
          "time": 0.4,
          "weight": 1,
          "timeScale": 0,
          "enabled": true,
          "paused": true,
          "loop": 2201,
          "repetitions": "infinite",
          "loopCount": -1,
          "clampWhenFinished": false
        }
      }
    }
  }
}
```

以上仅为字段示意。实际对象包含所有已载入人物及每人全部片段（含零权重片段），`clipName` 和 `duration` 必须匹配当前 GLB。`weight`、`timeScale` 是 Three.js 的有效值；当前场景通过显式设置片段时间采样，所以大多数动作 `paused=true` 且有效 `timeScale=0`。无限循环编码为字符串 `infinite`，读取时解码成 `Infinity`，不会在 JSON 往返中变成 `null`。`loopCount` 保留 PingPong 的方向奇偶，依赖随包固定的 Three.js 0.180.0 实现；更换引擎版本需要重跑相关测试。

捕获应在 `scene.apply(snapshot, dt)` 完成后调用该接口。回放把帧中的 `animationPose` 放入待显示 snapshot，再调用 `scene.apply(snapshot, 0)`。采样顺序为：恢复上一次偏移之前的位置 → 恢复每个片段的时间、权重及循环状态 → `mixer.update(0)` → 加上历史骨骼偏移 → 更新道具和关键点。导航根的位置、朝向和座位高度仍来自该帧的场景 snapshot，关键点局部修订不重复修改骨骼。

`scene.validateAnimationSnapshot(value)` 返回 `{ok, errors}`，检查完整片段集合、真实片段名和时长、有限时间/权重/速率及循环状态。`getAnimationSnapshot` 遇非法内部状态会抛错，避免把无效数值写成 JSON null。`apply` 对每个人物先完整验证再应用；不合法的记录不会部分写入动作，而采用确定性旧版回退，并在 `scene.animationPoseStatus.errors` 中报告。回放载入入口可先调用验证接口，向用户明确拒绝不兼容记录。

缺少该字段的旧采集仍按已保存的动作时间、步态相位和座位过渡进行重建。旧帧未保存混合权重，因此无法恢复原始切换混合；回放使用确定的单动作权重。旧帧里零速度 walk/run 统一使用 idle，不依赖之前浏览的帧。新帧保留真实渲染动作，零速度并不会覆盖其中已记录的 walk/run。普通暂停场景仍保持原有冻结行为。

退出回放或重置采样时恢复当前场景的运行选项；历史 poseOverrides 仍由原有临时快照机制恢复。动作名和时长检查不等同于资产内容哈希：若未来替换了同名同时长的 GLB 曲线，应同时版本化资产或保留原资产。

验证：新增 5 项单元测试覆盖混合与偏移叠加、JSON 往返、零速度直拖/顺播一致、座位过渡、非法数据和循环/运行选项恢复；真实 Chrome 加载全部 16 个模型、192 个片段、848 根骨骼，检验了各岗位切换混合、历史偏移以及直拖后的骨骼世界矩阵一致性。成品页面的采集落盘与回放入口由整体验收另外验证。
