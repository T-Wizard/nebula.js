import { generator as supernova } from '@nebula.js/supernova';
import themeFn from '@nebula.js/theme';
import localeFn from '@nebula.js/locale';

import permissions from './permissions';
import selectionsApi from './selections';

import snDefinition from 'snDefinition'; // eslint-disable-line
import extDefinition from 'extDefinition'; // eslint-disable-line

// TODO - how to initiate with the language used in Sense without importing the translator module from Sense?
const loc = localeFn();
const env = {
  translator: loc.translator,
};
const snGenerator = supernova(snDefinition, env);

const ext = typeof extDefinition === 'function' ? extDefinition(env) : extDefinition;

export default {
  // overridable properties
  definition: {
    type: 'items',
    component: 'accordion',
    items: {
      data: {
        uses: 'data',
      },
    },
  },
  support: {
    export: false,
    exportData: false,
    snapshot: false,
    viewData: false,
  },
  // override with user config
  ...ext,

  // =============================================
  // non-overridable properties
  initialProperties: snGenerator.qae.properties.initial,
  importProperties: null, // Disable conversion to/from this object
  exportProperties: null, // Disable conversion to/from this object
  template: '<div style="height: 100%;position: relative"></div>',
  mounted($element) {
    // create a theme api with default nebula theme
    // note that this will not consume a Sense theme
    this.theme = themeFn();

    const element = $element[0].children[0];
    const selectionAPI = selectionsApi(this.$scope);
    const sn = snGenerator.create({
      model: this.backendApi.model,
      app: this.backendApi.model.session.app,
      selections: selectionAPI,
    });
    this.sn = sn;
    this.snComponent = sn.component;
    this.snComponent.created({
      options: this.options || {},
    });
    this.snComponent.mounted(element);
  },
  paint($element, layout) {
    const perms = permissions(this.options, this.backendApi);
    const constraints = {
      passive: perms.indexOf('passive') === -1 || undefined,
      active: perms.indexOf('interact') === -1 || undefined,
      select: perms.indexOf('select') === -1 || undefined,
    };
    return this.snComponent.render({
      layout,
      context: {
        appLayout: {
          qLocaleInfo: this.backendApi.localeInfo,
        },
        constraints,
        theme: this.theme.externalAPI,
      },
    });
  },
  destroy() {
    this.sn.destroy();
    if (this.snComponent) {
      this.snComponent.willUnmount();
      this.snComponent.destroy();
    }
  },
};
