# Human Layer 本地采集与回放接口

此模块保存用户真实选择目录内的数据；不自动连接 EEG、不生成生理信号、不将仿真状态解释为真人心理真值。每次进入一个可操控角色，调用一次 `start`，产生新的 episode。结束角色前等待 `finish` 成功。当前页面版本为 v11.1，新采集的 `metadata.version` 为 `human-layer-11.1`，`metadata.replayClock` 为 `capture-wall-time`。

## 启动

交付构建沿用 `python3 serve.py`、macOS 的 `启动仿真.command` 和 Windows 启动器。服务器只监听 `127.0.0.1`，服务 `dist` 并处理 `/api/capture/*`。

Vite 开发代理示例（由主应用配置）：

```sh
python3 serve.py --port 5205 --no-browser --allow-origin http://127.0.0.1:5206 --allow-origin http://localhost:5206
```

```js
// Vite 运行于 5206；保留浏览器请求的 Host 和 Origin。
server: {
  host: '127.0.0.1', port: 5206, strictPort: true,
  proxy: { '/api/capture': { target: 'http://127.0.0.1:5205', changeOrigin: false } }
}
```

终端会打印实际后台端口。如果指定端口已被占用，原启动习惯会选择后续端口；开发代理的 target 必须对应实际端口。

## 页面 API

```js
import { SessionRecorder } from './session-recorder.js';
const recorder = new SessionRecorder({ onChange: current => updateCaptureUI(current) });
await recorder.selectLocation();                  // macOS 原生目录选择器，由用户点击触发
// 或 await recorder.useLocation('/absolute/output/folder'); // 用户明确填写，可创建目录
await recorder.start({ actorId: 'p14', participantId: 'P001', scene: 'restaurant', source: 'human-operated-simulation' });
recorder.recordFrame({ simTime: 2.1, snapshot, observation, autonomy });
recorder.recordEvent('serve-requested', { simTime: 2.1, customerId: 'p03' });
// 只有外部数据实际到达时才调用；source 必须描述实际来源，不可假称 EEG 已接入。
// recorder.recordSignal({ source: 'device-name', timestamp, channels, quality });
await recorder.flush();
await recorder.finish({ taskSucceeded: true });
const sessions = await recorder.list();
const replay = await recorder.load(sessions[0].id);
```

公开状态：`location` 为 `{id,path}`；`session` 含 `id/path/metadata/status/counts/createdAt/updatedAt`；`status` 为 `idle/selecting/ready/recording/saving/finished/error`；`error` 为 `Error|null`；`pendingCount` 是待确认记录总数；`isRecording` 指当前仍接受新记录。`onChange(recorder)` 在保存状态变化时调用。

没有选择目录时 `start` 拒绝启动。已有活动会话时不允许更换目录或创建下一会话。默认每 1500 毫秒增量落盘，也会在达到 250 条缓存记录时保存；单批限制为最多 250 条且约 6 MiB。`flush` 保存调用时已有的记录，新的采样留给下一批。`finish` 停止接受新记录、保存所有缓存、写入结束清单；失败后可再次 `finish`，不会悄悄切换到下一角色。

v11 页面按采集墙钟经过时间调度采样：场景/骨骼状态目标为 10 Hz、关键点目标为 2 Hz；启用「保存视角图像」时，JPEG 视角样本目标为 1 Hz。仿真暂停或打开资料库时仍保存周期帧，`simTime` 可以保持不变；周期帧附带 `simulationPaused` 和 `workspaceSection`。这些是目标采样率，实际受浏览器帧率、后台节流与渲染负载影响，不保证等间隔或达到目标频率。分析时须分别使用每条记录的实际采集时间和 `simTime`，不能用固定帧号代替时间。v10 及更早记录保留原先按仿真时间采样的语义。

Frame 和 signal 保留传入对象的顶层结构，额外增加 `_capture: {sequence, recordedAt, elapsedMs}`。例如回放中直接读取 `replay.frames[i].snapshot`。Event 保存为 `{type,payload,_capture}`。跨流排序可使用 `_capture.sequence`；标记 `replayClock: capture-wall-time` 的 v11 记录按 `_capture.elapsedMs` 统一回放帧、信号和事件，并保留独立的 `simTime`。索引器可使用明确的 `recordedAt` / 接收时刻作为兼容依据，缺少这些字段时才回落到 `simTime`；无法提取任何有效时间的帧会拒绝载入。未标记此时钟的旧版本继续按 `simTime` 回放，不能由此还原暂停期间未保存的墙钟间隔。入队时深拷贝，避免后续人物位置更新篡改历史帧。

## HTTP 合同

全部端点使用 `POST`、`Content-Type: application/json`，响应 JSON。成功状态 200；错误为 `{error: "可显示原因"}`。请求体上限 8 MiB。

| 路径（前缀 `/api/capture`） | 请求 | 响应 |
|---|---|---|
| `/location/select` | `{}` | `{location:{id,path}}`；取消时 `{cancelled:true,location:null}` |
| `/location/use` | `{path}` | `{location:{id,path}}` |
| `/sessions/start` | `{locationId,metadata:{actorId,...}}` | `{session}` |
| `/sessions/append` | `{locationId,sessionId,batchId,frames:[],events:[],signals:[]}` | `{session,duplicate}` |
| `/sessions/finish` | `{locationId,sessionId,summary:{}}` | `{session}`；重复结束幂等 |
| `/sessions/list` | `{locationId}` | `{sessions:[...]}`，按创建时间倒序 |
| `/sessions/load` | `{locationId,sessionId}` | `{session,frames:[],events:[],signals:[]}` |

`locationId` 是当前本地服务器进程生成的不透明授权句柄。重启服务后需要重新选择同一真实目录，再列出或加载历史会话。显式路径必须为绝对路径（支持展开 `~`），不接受 `..`；创建目录属于用户明确选择路径的操作。

API 校验浏览器 `Origin`、`Host` 和 `Sec-Fetch-Site`；生产只接受当前本地同源，开发代理必须通过 `--allow-origin` 明确配置并保持 Host。接口不提供 CORS 授权，不接受缺失 Origin、远程网站、`null` origin 或跨站请求。GET 不能调用采集写接口。

## 文件与恢复

```text
用户选择的目录/
  episode-UTC时间-随机UUID/
    manifest.json
    frames.jsonl
    events.jsonl
    signals.jsonl
```

创建会话会立即建立全部文件和 `recording` 清单。没有任何设备包写入时 `signals.jsonl` 为空，清单的 `signalSources` 为空。`device/status/quality` 也可写入此流；仅有连接或质量包不等于已经采到 EEG / 眼动样本。文件只能写入已选择目录中的合法 episode 子目录；会话/流文件不能是符号链接，API 参数不能任意指定文件名。

批次先写 `.pending.json` 事务记录，再追加并同步三个 JSONL，最后原子更新 manifest。只有 manifest 中包含批次 ID 才算已提交。客户端直到收到确认才释放批次缓存；响应丢失时重发同一个 `batchId`，服务端去重，避免重复帧。读取/重试时会回滚中断事务的未提交尾部，已提交块保留。

浏览器意外关闭前尚未确认的内存缓冲不能保证恢复；本地已确认的块可以重新选目录后加载。未正常结束的会话保持 `status: recording`，UI 应将其显示为“未完成 / 可回放已保存部分”，不能当成完整成功实验。没有自动恢复录制；再次进入角色产生新的 episode。

`list/load` 是本地文件读取入口；当前 `load` 一次读取一个会话的所有 JSONL。超长采集的分页读取与压缩归档尚未实现，应根据实际帧率和数据体积选择合理会话时长。

## 验证

```sh
PYTHONDONTWRITEBYTECODE=1 python3 tests/storage_capture_test.py
node --test tests/recorder.test.mjs
```

验证覆盖临时真实目录、创建独立 episode、即时文件、逐批去重、结束/回放、写入失败回滚、重启后中断尾部恢复、路径穿越和符号链接拒绝、同源/开发代理校验，以及客户端确认丢失重试、深拷贝、多批结束和结束失败重试。测试不连接任何 EEG 设备。

## 本地设备桥协议（当前页面）

页面可连接用户指定的本机 WebSocket，例如 `ws://127.0.0.1:8765`。只接受 `localhost`、`127.0.0.1` 或 `[::1]` 的 `ws:` / `wss:` 地址。设备 SDK、采样和解码在外部桥程序中完成；本项目不附带设备驱动或脑电解码器。

连接建立后，页面向桥发送：

```json
{"type":"hello","protocol":"mindspace-sensors/v1"}
```

桥向页面发送 JSON 对象。当前接受 `eeg/gaze/quality/device/status/intent`。前五类的 `timestamp` 可省略；若提供，必须为有限数值。`intent` 仍必须提供有限数值 `timestamp`。设备时间原值及可选的 `timestampUnit`、`clockDomain` 分别保留，不强制把设备秒、计数器或其他时钟解释为 Unix 毫秒；桥应明确声明时间单位和时钟域。例如 Cortex 的 Unix UTC 秒不能直接当成浏览器毫秒。

页面另外保存 `receivedAt`（浏览器接收时的 Unix 毫秒）、`simTime`（仿真秒）、`actorId`、`simulationPaused`、`workspaceSection` 和采集记录序号。实时图表以接收时间排布；声明采样率的 EEG 批次按标称间隔从接收锚点向前展开，这是显示时间排列，不是设备时钟同步。页面不会自动校正设备时钟漂移，也尚未实测设备采样、桥转发、浏览器接收之间的硬件同步延迟。以下数字只是协议示例，明确标为测试注入，不代表人体测量。

```json
{"type":"eeg","source":"TEST_INJECTED_NOT_DEVICE_MEASURED","provenance":"TEST_INJECTED_NOT_DEVICE_MEASURED","timestamp":1788796800.125,"timestampUnit":"s","clockDomain":"unix-utc","samples":[12.3,-4.8,null],"channels":["F3","F4","AF3"],"units":"uV","sampleRateHz":128}
```

`eeg.samples` 接受一条通道向量，或 sample-major 二维批次数组，数值须有限，明确缺样可用 `null`；外层最多 8192 项。有 `channels` 时每行须与它等长，名称只能是当前 EPOC 预设内 1–14 个不重复通道。`units`（复数）支持 `uV/mV/V`，`sampleRateHz` 当前支持 128 或 256。缺少通道或单位的旧数据可保留，但不会猜测为 14 路已校准波形；未声明采样率时不推断批次内部时间间隔。明确的 mV/V 仅转换用于 µV 显示，保存包不变。额外设备配置、原始 `cols`、插值标记等字段原样进入记录。当前实现没有滤波、伪迹去除或 EEG 生理有效性验证。完整通道与质量字段见 [v11 神经信号接口](neuro-dashboard.md)。

```json
{"type":"gaze","source":"TEST_INJECTED_NOT_DEVICE_MEASURED","x":0.46,"y":0.32,"valid":true,"coordinateSystem":"viewport-normalized","leftEye":{"valid":true,"pupilDiameter":3.2,"pupilUnit":"mm"},"rightEye":{"valid":false}}
```

`coordinateSystem: viewport-normalized` 时，`gaze.x/y` 表示 **完整三维场景视口（含视野外深色遮罩）** 内归一化到 0–1 的坐标，原点在左上；不包含侧边控制面板，也不是去掉遮罩后的图像坐标。屏幕或眼镜坐标须先由设备桥标定并转换到当前三维画布边界；改变窗口或 iframe 布局后需更新该转换。`observation.camera.imageViewport.normalized` 给出有效成像矩形；若设备输出的是矩形内部的 `u/v`，须先转换为 `x = rect.x + u * rect.width`、`y = rect.y + v * rect.height`。仅已映射到此视口且可用的点可在有效成像矩形内以相机射线寻找人物或地面候选；遮罩区域拾取返回 `null`。眼动候选本身不会执行服务动作。

独立眼动图也支持 `screen-normalized`，以及同时声明 `screen.width/height` 的 `screen-pixels`；这些屏幕坐标不直接用于三维选取。未知坐标系保留原坐标，不猜测视口映射。`valid:false` 可不带坐标；可选的 `leftEye/rightEye` 独立保存有效性、坐标、瞳孔直径/单位与质量。旧包没有 `coordinateSystem/valid` 时仅兼容原有视口协议，显示 `validityDeclared:false`，不等于设备已校准或确认有效。旧 `quality` 对象原样保留为元数据，不冒充数值质量。双向视野、像素映射与回放约定见 [人物视野与眼动坐标](camera-view.md)。

`quality` 用 `stream: eeg`，分别提供按通道名索引的 `contactQuality/eegQuality`，以及 `cqScale/eqScale`；支持命名量程 `emotiv-cq-0-4/emotiv-eq-0-4` 或显式 `{min,max,label}`，也可在每项使用 `{values,scale}`。设备提供的 `eegQuality.overall/sampleRateQuality` 原值保留，不以通道平均值重新计算。`device/status` 使用 `stream: eeg/gaze/all`、`connected: true/false/null`，可带 `deviceId/reason`；连接、收到数据和数据质量是不同状态。缺失或过期质量保持未知状态。

```json
{"type":"intent","source":"TEST_INJECTED_NOT_DEVICE_MEASURED","timestamp":1788796800.03,"timestampUnit":"s","clockDomain":"unix-utc","action":"takeorder","confidence":0.86,"detail":{"customerId":"p03"}}
```

`intent.confidence` 必须在 0–1。当前支持动作：`move`、`approach`、`takeorder`、`serve`、`carry`、`wait`、`yield`、`cancel`、`manual`。例如 `move.detail` 使用世界坐标 `{x,z}`，服务动作使用 `{customerId}`，`manual.detail` 使用 `{forward,turn}`。动作是否可执行仍由角色控制器和场景导航校验。

只有置信度 **≥ 0.8** 的包会成为待确认候选；用户必须点击「确认候选指令」，才交给角色控制器执行。置信度是外部桥提供的数值，本页面没有训练、校准或验证该解码器，也不会将候选直接当成真实意图。单包序列化长度不得超过 262144 个字符。

设备包可以在未采集时用于连接检查和计数，只有当前采集会话接受记录时才写入 `signals.jsonl`；回放状态不记录新输入，也不会据此控制历史角色。同页集成入口 `window.mindspaceHumanLayer.submitSignal(packet)` 使用相同校验。保存时保留包声明的 `source`；未声明时回落为 `external-device`，另加 `transportSource: external-device` 标识接入通路。两者都不是硬件身份、人体真实性或质量证明。测试包及其回放必须保留 `TEST_INJECTED_NOT_DEVICE_MEASURED` 等明确测试来源标记，不能作为真实人体测量交付。

## 三维状态、JPEG 视角样本与视频

本轮保存三维场景状态、人物动作时间/相位、相机姿态、观察元数据、事件与实际传入的信号。页面还提供可选的「保存视角图像」设置：开启时，将网页三维视角实际渲染后的 RGB JPEG 样本随对应 frame 保存，最长宽度为 640 像素，保持视口宽高比。

```js
frame.image = {
  mimeType: 'image/jpeg',
  width: 640,
  height: 400,
  dataUrl: 'data:image/jpeg;base64,…'
};
```

该字段在有图像样本的帧中出现；未开启或该帧未采样图像时没有此字段。`width/height` 以实际记录值为准。图像在对应场景帧渲染后截取，包含完整三维画布的视野外遮罩，不包含 HTML 地图、控制面板、神经信号仪表盘或注视光标。保存的是仿真网页的三维视角，不是真实餐厅摄像机画面。将同帧 `camera.imageViewport.normalized` 乘以 JPEG 的实际尺寸，即可得到图像内的有效成像矩形。v11 场景状态约 10 Hz、关键点约 2 Hz、图像约 1 Hz 均为采集墙钟上的目标频率，实际受渲染帧率影响。仿真暂停时可以保存相同场景状态及其实际渲染图像，不代表人物仍在运动。

`frames.jsonl` 因而可以包含实际 JPEG 像素样本，也可以只包含三维状态。`/sessions/append` 将 image 作为 JSON 字段一起持久化，没有单独的视频编码、视频文件或 Depth 采集接口。不要把稀疏 JPEG 样本宣称为连续视频、深度图或完整视觉数据集。

页面「采集回放」主要使用已保存状态重新渲染三维场景；这是状态重建，独立保留的 JPEG 可用于核对当时的视角。原页面截图按钮单独下载 PNG，不会自动附加到采集会话。用于后续视觉训练时，应检查图像字段实际存在、采样时间与标签对齐，并固定场景资产、渲染配置和相机标定版本。


## Human Layer 资料库与团队扩展（v6 / v7）

`metadata.libraries` 保存本次人物配置、显式顾客团队与动作/事件库配置。v6/v7 历史记录还可能有点评分析来源摘要；当前人格页已改为平行的基础属性、大五人格与行为标签，不再展示点评语言分析入口。每个成员仍为独立 agent，决策上下文的 `group` 是关系副本。回放读取历史团队，不覆盖当前团队。帧中的观察包含 `look.yawDeg/pitchDeg`、`camera.verticalFovDeg/horizontalFovDeg`，以及世界相机位置和四元数。人工调节控件产生 `camera_adjusted` 事件；资料页切换产生 `workspace_changed`，在资料页暂停仿真时间。

`window.mindspaceHumanLayer.navigate(section)` 可切换工作区页面，`getPersona(actorId)` 返回复制的已绑定档案。语义决策适配器的 `context.persona` 为完整档案；高频自主状态快照只保留人格引用，完整版本保存在采集清单。当前基础资料、大五参数与行为标签为用户配置或未来外部来源接口，不等于实测心理状态。

v11 资料库期间只暂停场景运行，墙钟驱动的场景采样与实际设备输入保存继续进行，并带 `simulationPaused`、`workspaceSection`；固定 `simTime` 不表示设备时间停止。此时不进行眼动拾取或接受待确认的解码动作，原始 intent 另记为 `decoded_candidate_deferred`。v6–v10 旧采集中资料库暂停期间可能没有场景帧，回放不能补造未保存的状态。

## v7 固定双向视野

人物第一人称默认水平 90°、垂直 60°，两项可独立设定，改变视口尺寸不会改变角宽。`metadata.visionSettings` 保存采集开始时的角色配置快照；逐帧 `observation.camera` 保存实际 `horizontalFovDeg`、`verticalFovDeg`、`projection`、`viewportPolicy` 和 `imageViewport`。回放使用录制角宽重新适配当前窗口；回放中的手动视野调整是临时状态，不覆盖人物当前保存的配置。完整字段与接口见 [人物视野与眼动坐标](camera-view.md)。

## v9 场景、姿态与动画采样

`metadata.sceneContext`和`metadata.libraries.sceneContext`保存本次场景身份与资源路径；`metadata.libraries.poseOverrides`保存按人物/片段的骨骼和关键点修订。回放列表只显示当前场景记录。缺少场景身份的旧餐厅记录归入restaurant。

每个新保存帧的`animationPose`记录GLB动画的实际采样时间、有效混合权重和运行参数。回放时先恢复采样，再叠加本次采集保存的修订。格式说明见[动画采样与回放](animation-capture-v9.md)。无动画快照的旧帧走确定性兼容路径，不能还原未保存的混合权重。格式无效、版本不支持或片段与当前GLB不匹配时拒绝载入，不静默套用当前编辑。

`window.mindspaceHumanLayer.getKeypoints()`返回当前应用修订后的世界关键点；`getState().workspace.poseOverrides`在回放时返回实际历史临时修订，退出后返回本机保存修订。临时回放不覆盖人物、团队、计划、视野或姿态存储。新版每帧采样数据增加文件量，目标采样频率与真实帧数继续由manifest与JSONL记录提供。


## v10 标准肌肉参考与历史编辑

v10 记录的 `manifest.metadata.version` 为 `human-layer-10.0`；v11 新记录改为 `human-layer-11.1`，继续使用以下肌肉快照约定。`metadata.libraries.muscleOverrides` 保存 `human-muscle-overrides-v1` 快照：场景ID、标准解剖资产ID及可用的SHA-256、修订号、每个人的肌肉ID和局部位置/尺度/肌腹厚度。`referenceOnly: true` 表明这些是标准参考体的几何配置，不是个体医学测量，也不参与餐厅人物动画或肌力计算。

肌肉配置按场景、人物、肌肉独立保存，不按动画片段保存。进入采集或回放后，人物肌肉编辑只读；加载回放前检查场景、资产和修订格式，使用临时历史快照，不覆盖浏览器里当前的配置。退出回放恢复当前配置。旧采集没有此字段时，回放临时使用空修订，不能把当前修改冒充为历史数据。

`window.mindspaceHumanLayer.getState().workspace.muscleOverrides` 返回当前有效快照；采集期间返回当前已保存修订，回放期间返回历史快照。未保存的编辑草稿不会进入正式采集元数据。v10 当时仅有生理展示建议；v11 已增加下面的 EEG 与独立眼动仪表盘。当前没有 EMG 界面或肌力计算，标准肌肉几何编辑也不代表生理激活。

## v11 信号仪表盘、墙钟回放与显示边界

进入角色 / 专家示范后，三维视窗下方提供可收起、可放大的神经信号面板，保留原专家控制与 minimap。14 路 EEG 指电极通道，不是 14 个脑区；面板支持通道选择、2/5/10 秒时间窗、µV 量程、独立 CQ/EQ 电极图、眼动 X/Y 轨迹、左右眼有效性/瞳孔和实际事件标记。没有输入时保持空白等待，不播放假波形，不用绿色填充未知接触质量。设备断连、信号过期、质量未知分别显示；保留的历史质量注明过期。

默认“首点对齐”在每个当前时间窗内，按该通道第一个有效样本提供固定显示偏移；可切回“原始零线”。所选通道显示最近有效的绝对 µV 值和偏移量。这仅改变绘图坐标，不改写保存的原始包，不实施高通、去趋势或去伪迹。“冻结显示”只冻结当前图表快照，设备接收与采集继续；界面仍更新真实包率、待保存数和已保存信号数。

新 episode 使用 `metadata.version: human-layer-11.1` 与 `replayClock: capture-wall-time`。即使人物或资料库暂停，周期帧、事件和实际信号仍可沿采集经过时间推进。回放按历史采集游标呈现当时已发生的 EEG、眼动和事件；向后拖动不保留未来样本。没有对应信号的历史记录保持空白，未标记新时钟的旧记录继续兼容 `simTime` 回放。

回放期间信号面板明确标为只读，不能从中连接设备、添加示范标记或确认动作控制；显示缩放、通道筛选和冻结仍可使用。历史人物、团队、计划、视野、姿态与肌肉配置均临时应用，退出回放恢复实时配置。`window.mindspaceHumanLayer.getState().neuroDashboard` 返回显示状态，`getNeuroSignals(options)` 返回有界显示快照；这些接口不是原始信号全集导出，完整记录以已落盘的 `signals.jsonl` 为准。

本轮只通过带明确来源标记的测试注入验证界面和采集链路，没有连接实体 EEG / 眼动硬件。`source`、`transportSource`、包率、采样率声明和接收时间不能证明硬件真实性、生理有效性、解码准确率或 EEG–眼动同步精度。详细字段及方法边界见 [v11 神经信号说明](neuro-dashboard.md) 和 [仪表盘模块接口](neuro-dashboard-v11.md)。

本机WebSocket连接、错误和断开也记录为`type:status`、`source:mindspace-device-bridge`、`connectionScope:transport`的状态包，并添加实际连接事件。它们是页面观察到的传输状态，不是假称设备测量的脑电数据；采集封口后不追加。回放据此还原断线状态。信号回放边界包含完整采集时长，即使末尾只有场景帧，没有新的信号，历史信号也会正常过期。
