/**
 * Prompt Module Index
 * ===================
 * Re-exports all prompt templates from modular files.
 */

export { classify_article } from './classify';
export { score_signal } from './score';
export {
  write_brief,
  write_analysis,
  write_deep_dive,
  summarize,
  build_entity_profile,
} from './write-article';
export {
  generate_seo_title,
  generate_meta_description,
  generate_faqs,
} from './seo';
export {
  compile_newsletter,
  write_daily_digest,
} from './digest';
export { truth_engine_analyze } from './truth-engine';
export { predict_impact } from './predict-impact';
export {
  intake_analyze,
  write_quick_facts,
  write_explained,
} from './intake-analyzer';
export {
  translate_article,
  detect_and_normalize,
  SUPPORTED_LANGUAGES,
} from './translate';
