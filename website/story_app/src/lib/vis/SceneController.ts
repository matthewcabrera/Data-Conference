import * as d3 from 'd3';
import type { BeatSpec, SceneContext, SceneModule, SceneRuntimeState, SharedLayers, StoryMetrics, StoryVisualDoc } from './types';
import { createSceneGraph } from './sceneGraph';
import { clamp } from './transitions';

export class SceneController {
  private host: HTMLElement;
  private doc: StoryVisualDoc;
  private metrics: StoryMetrics;

  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private rootLayer: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private sharedLayers: SharedLayers | null = null;

  private scenes = new Map<string, SceneModule>();
  private activeBeat: BeatSpec | null = null;
  private activeScene: SceneModule | null = null;
  private activeProgress = 1;
  private activeDirection: -1 | 0 | 1 = 0;

  private width = 980;
  private height = 620;
  private resizeRaf = 0;
  private onResizeBound = this.onResize.bind(this);

  constructor(host: HTMLElement, doc: StoryVisualDoc, metrics: StoryMetrics) {
    this.host = host;
    this.doc = doc;
    this.metrics = metrics;
  }

  init() {
    this.buildChartRoot();
    this.buildSharedLayers();
    this.mountScenes();

    const firstBeat = this.doc.beats[0];
    if (firstBeat) this.goToBeat(firstBeat, 1, 0);

    window.addEventListener('resize', this.onResizeBound);
  }

  goToBeat(beat: BeatSpec, progress: number, direction: -1 | 0 | 1) {
    if (!this.svg || !this.rootLayer) return;

    const nextScene = this.scenes.get(beat.scene_id);
    if (!nextScene) return;

    const runtimeState: SceneRuntimeState = {
      beat,
      progress: clamp(progress),
      direction,
      width: this.width,
      height: this.height
    };

    if (!this.activeScene || this.activeScene.id !== nextScene.id) {
      if (this.activeScene) this.activeScene.exit(runtimeState);
      this.activeScene = nextScene;
      this.activeScene.enter(runtimeState);
    }

    this.activeScene.update(runtimeState);
    this.activeBeat = beat;
    this.activeProgress = runtimeState.progress;
    this.activeDirection = direction;
  }

  destroy() {
    window.removeEventListener('resize', this.onResizeBound);
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);

    this.scenes.forEach((scene) => scene.destroy());
    this.scenes.clear();

    if (this.svg) this.svg.remove();
    this.svg = null;
    this.rootLayer = null;
    this.sharedLayers = null;
  }

  private onResize() {
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => {
      const prevBeat = this.activeBeat;
      const prevProgress = this.activeProgress;
      const prevDirection = this.activeDirection;

      this.scenes.forEach((scene) => scene.destroy());
      this.scenes.clear();
      if (this.svg) this.svg.remove();

      this.buildChartRoot();
      this.buildSharedLayers();
      this.mountScenes();

      this.activeScene = null;
      if (prevBeat) this.goToBeat(prevBeat, prevProgress, prevDirection);
    });
  }

  private buildChartRoot() {
    this.width = Math.max(360, this.host.clientWidth || 980);
    const hostHeight = this.host.clientHeight || Math.round(window.innerHeight * 0.7);
    this.height = Math.max(420, Math.min(760, hostHeight));

    this.svg = d3
      .select(this.host)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('role', 'img')
      .attr('aria-label', 'Interactive story chart stage');

    this.rootLayer = this.svg.append('g').attr('class', 'scene-root');
  }

  private buildSharedLayers() {
    if (!this.rootLayer) return;
    this.sharedLayers = {
      axisLayer: this.rootLayer.append('g').attr('class', 'shared-axis'),
      pointsLayer: this.rootLayer.append('g').attr('class', 'shared-points'),
      lineLayer: this.rootLayer.append('g').attr('class', 'shared-line'),
      overlayLayer: this.rootLayer.append('g').attr('class', 'shared-overlay'),
      annotationLayer: this.rootLayer.append('g').attr('class', 'shared-annotations')
    };
  }

  private mountScenes() {
    if (!this.svg || !this.rootLayer || !this.sharedLayers) return;

    const ctx: SceneContext = {
      svg: this.svg,
      rootLayer: this.rootLayer,
      sharedLayers: this.sharedLayers,
      width: this.width,
      height: this.height,
      data: this.metrics.scene_data,
      metrics: this.metrics
    };

    createSceneGraph().forEach((scene) => {
      scene.init(ctx);
      this.scenes.set(scene.id, scene);
    });
  }
}
