export type BeatId =
  | 'b1_curve_mechanism'
  | 'b2_rwanda_trajectory'
  | 'b3_vietnam_brief'
  | 'b4_us_comparison_arc'
  | 'b5_mirror_case'
  | 'b6_what_changes_gap'
  | 'b7_close';

export type VisualScene =
  | 'scene01_mechanism'
  | 'scene02_rwanda'
  | 'scene03_vietnam'
  | 'scene04_us'
  | 'scene05_mirror'
  | 'scene06_compression'
  | 'scene07_close';

export interface AnnotationSpec {
  id: string;
  text: string;
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  anchor?: 'start' | 'middle' | 'end';
}

export interface DetailCardSpec {
  label: string;
  value: string;
  note?: string;
  claim_id?: string;
}

export interface CardPage {
  card_id: string;
  kicker?: string;
  headline: string;
  body: string;
  citation_keys?: string[];
  visual_cue?: string;
  dwell_ms?: number;
}

export interface StageStateRef {
  emphasis?: string;
  show_distribution?: boolean;
  year?: number;
}

export interface BeatSpec {
  beat_id: BeatId;
  label: string;
  headline: string;
  body: string;
  scene_id: VisualScene;
  cards: CardPage[];
  annotations: AnnotationSpec[];
  detail_cards: DetailCardSpec[];
  aria_summary: string;
  stage_state?: StageStateRef;
  progress_windows?: {
    intro: [number, number];
    reveal: [number, number];
    settle: [number, number];
  };
}

export interface ThemeSpec {
  colors: {
    ink: string;
    muted: string;
    accent: string;
    positive: string;
    negative: string;
    paper: string;
    grid: string;
    dark_bg: string;
  };
  type: {
    headline: string;
    body: string;
    ui: string;
    mono: string;
  };
  motion: {
    base_ms: number;
    slow_ms: number;
    easing: string;
  };
}

export interface StoryVisualDoc {
  story_id: string;
  title: string;
  dek: string;
  beats: BeatSpec[];
  theme: ThemeSpec;
  version: string;
  methods_endnote: {
    bullets: string[];
    source_doc: string;
  };
}

export interface ScenePoint {
  code: string;
  name: string;
  gni_percap: number;
  life_exp: number;
  residual_gap: number;
  residual_z: number;
  predicted: number;
}

export interface YearPoint {
  year: number;
  points: ScenePoint[];
}

export interface CountrySeriesPoint {
  year: number;
  value: number;
  gni_percap?: number;
  predicted?: number;
  residual_gap?: number;
}

export interface CountrySeries {
  code: string;
  metric: string;
  values: CountrySeriesPoint[];
}

export interface DistributionPoint {
  year: number;
  median_abs_gap: number;
  p90_abs_gap: number;
  max_pos_gap: number;
  max_neg_gap: number;
  mean_abs_gap: number;
}

export interface SceneData {
  year_anchor: number;
  points: ScenePoint[];
  year_points: YearPoint[];
  model: {
    slope: number;
    intercept: number;
    r2: number;
  };
  country_series: CountrySeries[];
  distribution: DistributionPoint[];
  us_peer_codes: string[];
  snapshots: {
    usa_2010_actual: number;
    usa_2010_predicted: number;
    usa_gap_2006: number;
    usa_gap_2010: number;
    usa_gap_2015: number;
    usa_maternal_2006: number;
    usa_maternal_2015: number;
    usa_infant_pct_change: number;
    usa_under5_pct_change: number;
    peer_maternal_pct_change: number;
    peer_infant_pct_change: number;
    peer_under5_pct_change: number;
    can_maternal_2006: number;
    can_maternal_2015: number;
    vnm_gap_2010: number;
    gnq_2010_actual: number;
    gnq_2010_predicted: number;
    sle_maternal_2010: number;
    dist_2006_median_abs_gap: number;
    dist_2015_median_abs_gap: number;
    dist_2006_p90_abs_gap: number;
    dist_2015_p90_abs_gap: number;
  };
}

export interface ClaimRegistryItem {
  claim_id: string;
  value: number | string;
  source_ref: string;
}

export interface StoryMetrics {
  scene_data: SceneData;
  kpis: {
    country_count: number;
    r2_2010: number;
    median_abs_gap_2010: number;
    p90_abs_gap_2010: number;
    max_pos_gap_2010: number;
    max_neg_gap_2010: number;
  };
  claim_registry: ClaimRegistryItem[];
}

export interface SceneRuntimeState {
  beat: BeatSpec;
  progress: number;
  direction: -1 | 0 | 1;
  width: number;
  height: number;
}

export interface SceneContext {
  svg: import('d3').Selection<SVGSVGElement, unknown, null, undefined>;
  rootLayer: import('d3').Selection<SVGGElement, unknown, null, undefined>;
  sharedLayers: SharedLayers;
  width: number;
  height: number;
  data: SceneData;
  metrics: StoryMetrics;
}

export interface SharedLayers {
  axisLayer: import('d3').Selection<SVGGElement, unknown, null, undefined>;
  pointsLayer: import('d3').Selection<SVGGElement, unknown, null, undefined>;
  lineLayer: import('d3').Selection<SVGGElement, unknown, null, undefined>;
  overlayLayer: import('d3').Selection<SVGGElement, unknown, null, undefined>;
  annotationLayer: import('d3').Selection<SVGGElement, unknown, null, undefined>;
}

export interface SceneModule {
  id: VisualScene;
  init(ctx: SceneContext): void;
  enter(state: SceneRuntimeState): void;
  update(state: SceneRuntimeState): void;
  exit(state: SceneRuntimeState): void;
  destroy(): void;
}

// ── V6 timeline state ──

export interface TimelineState {
  stepIndex: number;
  stepProgress: number;
  direction: -1 | 0 | 1;
  entered_at: number;
}

export interface ViewportState {
  width: number;
  height: number;
  is_mobile: boolean;
}
