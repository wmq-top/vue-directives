import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ['src/index'],
  clean: true,
  rollup: {
    inlineDependencies: true,
    esbuild: {
      minify: true
    }
  },
  alias: {
    prompt: 'prompts/lib/index/js'
  },
  hooks: {
    'rollup:options'(ctx, options) {
      if(!options.plugins) {
        options.plugins = []
      }
    }
  }
})