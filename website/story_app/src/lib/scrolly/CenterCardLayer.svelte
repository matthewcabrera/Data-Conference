<script lang="ts">
  export let offsetTop = '50%';
  export let placement: 'center' | 'upper_center' | 'lower_center' = 'center';

  const placementMap = {
    center: '50%',
    upper_center: '35%',
    lower_center: '74%'
  };

  $: resolvedTop = placement !== 'center' ? placementMap[placement] : offsetTop;
</script>

<div class="center-layer" style={`top:${resolvedTop};`}>
  <slot />
</div>

<style>
  .center-layer {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(92vw, 1280px);
    pointer-events: none;
    z-index: 6;
  }

  .center-layer :global(*) {
    pointer-events: auto;
  }

  @media (max-width: 900px) {
    .center-layer {
      width: min(94vw, 900px);
      top: 68% !important;
    }
  }
</style>
