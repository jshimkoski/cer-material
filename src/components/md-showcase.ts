import {
  component,
  html,
  css,
  ref,
  useStyle,
} from '@jasonshimmy/custom-elements-runtime';
import { when } from '@jasonshimmy/custom-elements-runtime/directives';

// Module-level — not inside the component function, so never reset on re-renders.
let snackbarTimer: ReturnType<typeof setTimeout> | null = null;

component('md-showcase', () => {
  // ── State ──────────────────────────────────────────────────────────────
  const dialogOpen     = ref(false);
  const snackbarOpen   = ref(false);
  const snackbarMsg    = ref('');  const menuOpen       = ref(false);
  const filterSelected = ref(false);
  const switchSelected = ref(false);
  const checkState     = ref(false);
  const radioValue     = ref('option1');
  const sliderValue    = ref(40);
  const activeNav      = ref('home');

  const closeSnackbar = () => {
    if (snackbarTimer !== null) { clearTimeout(snackbarTimer); snackbarTimer = null; }
    snackbarOpen.value = false;
  };

  const showSnackbar = (msg: string, duration = 4000) => {
    // Cancel any running timer first.
    if (snackbarTimer !== null) { clearTimeout(snackbarTimer); snackbarTimer = null; }
    snackbarMsg.value = msg;
    snackbarOpen.value = true;
    snackbarTimer = setTimeout(() => { snackbarTimer = null; snackbarOpen.value = false; }, duration);
  };

  const navItems = [
    { id: 'home',     label: 'Home',     icon: 'home' },
    { id: 'explore',  label: 'Explore',  icon: 'explore' },
    { id: 'library',  label: 'Library',  icon: 'library_music', badge: 3 },
    { id: 'profile',  label: 'Profile',  icon: 'person' },
  ];

  const tabs1 = [
    { id: 'tab1', label: 'Music',   icon: 'music_note' },
    { id: 'tab2', label: 'Albums',  icon: 'album' },
    { id: 'tab3', label: 'Artists', icon: 'person' },
    { id: 'tab4', label: 'Radio',   icon: 'radio' },
  ];

  const menuItems = [
    { id: 'edit',   label: 'Edit',   icon: 'edit' },
    { id: 'copy',   label: 'Copy',   icon: 'content_copy' },
    { id: 'cut',    label: 'Cut',    icon: 'content_cut' },
    { id: 'div',    label: '',       divider: true },
    { id: 'delete', label: 'Delete', icon: 'delete', disabled: false },
  ];

  // ── New component state ───────────────────────────────────────────────
  const drawerOpen      = ref(true);
  const drawerModalOpen = ref(false);
  const activeDrawer    = ref('inbox');
  const activeRail      = ref('home');
  const bottomSheetOpen = ref(false);
  const sideSheetOpen   = ref(true);
  const sideSheetModalOpen = ref(false);
  const segSelected     = ref('day');
  const datePickerOpen  = ref(false);
  const datePickerValue = ref('');
  const timePickerOpen  = ref(false);
  const timePickerValue = ref('');
  const timePickerVariant = ref<'dial' | 'input'>('dial');

  const drawerItems = [
    { id: 'inbox',     label: 'Inbox',     icon: 'inbox' },
    { id: 'outbox',    label: 'Outbox',    icon: 'outbox' },
    { id: 'favorites', label: 'Favorites', icon: 'star' },
    { id: '',          divider: true },
    { id: 'trash',     label: 'Trash',     icon: 'delete' },
    { id: 'spam',      label: 'Spam',      icon: 'report' },
  ];

  const railItems = [
    { id: 'home',    label: 'Home',    icon: 'home' },
    { id: 'explore', label: 'Explore', icon: 'explore' },
    { id: 'library', label: 'Library', icon: 'library_music', badge: 3 },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  const carouselItems = [
    { id: 'c1', headline: 'Seaside Retreat',  supportingText: 'Ocean view',      color: '#4A90D9' },
    { id: 'c2', headline: 'Mountain Escape',  supportingText: 'Alpine views',    color: '#6B8F71' },
    { id: 'c3', headline: 'City Break',       supportingText: 'Urban adventure', color: '#8B6F8E' },
    { id: 'c4', headline: 'Desert Journey',   supportingText: 'Sandy dunes',     color: '#C4982E' },
    { id: 'c5', headline: 'Forest Trail',     supportingText: 'Nature walk',     color: '#5F8B6C' },
  ];

  useStyle(() => css`
    :host { display: block; }

    /* ── Page Layout ── */
    .page {
      min-height: 100vh;
      background: var(--md-sys-color-background, #FFFBFE);
      color: var(--md-sys-color-on-background, #1C1B1F);
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
    }

    /* ── Content ── */
    .main-content {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 16px 120px;
    }

    /* ── Sections ── */
    .section {
      margin-bottom: 48px;
    }
    .section-title {
      font-size: 24px;
      font-weight: 400;
      color: var(--md-sys-color-on-surface, #1C1B1F);
      margin: 0 0 8px;
      padding: 0;
    }
    .section-subtitle {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      margin: 0 0 20px;
    }

    /* ── Row layout ── */
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .row.column { flex-direction: column; align-items: flex-start; }
    .row.start  { align-items: flex-start; }

    /* ── Demo chip / label dividers ── */
    .demo-label {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 4px;
      margin-top: 12px;
    }

    /* ── Card helpers ── */
    .card-content {
      padding: 16px;
    }
    .card-media {
      height: 140px;
      background: linear-gradient(135deg,
        var(--md-sys-color-primary, #6750A4) 0%,
        var(--md-sys-color-tertiary, #7D5260) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 48px;
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48;
    }
    .card-title {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 4px;
      color: var(--md-sys-color-on-surface, #1C1B1F);
    }
    .card-body {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      margin: 0 0 12px;
      line-height: 20px;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    /* ── Typography demo ── */
    .type-row {
      margin-bottom: 16px;
    }
    .display-large  { font-size: 57px; font-weight: 400; line-height: 64px; }
    .display-medium { font-size: 45px; font-weight: 400; line-height: 52px; }
    .display-small  { font-size: 36px; font-weight: 400; line-height: 44px; }
    .headline-large  { font-size: 32px; font-weight: 400; line-height: 40px; }
    .headline-medium { font-size: 28px; font-weight: 400; line-height: 36px; }
    .headline-small  { font-size: 24px; font-weight: 400; line-height: 32px; }
    .title-large   { font-size: 22px; font-weight: 400; line-height: 28px; }
    .title-medium  { font-size: 16px; font-weight: 500; line-height: 24px; }
    .title-small   { font-size: 14px; font-weight: 500; line-height: 20px; }
    .body-large    { font-size: 16px; font-weight: 400; line-height: 24px; }
    .body-medium   { font-size: 14px; font-weight: 400; line-height: 20px; }
    .body-small    { font-size: 12px; font-weight: 400; line-height: 16px; }
    .label-large   { font-size: 14px; font-weight: 500; line-height: 20px; }
    .label-medium  { font-size: 12px; font-weight: 500; line-height: 16px; }
    .label-small   { font-size: 11px; font-weight: 500; line-height: 16px; }

    /* ── Color palette ── */
    .color-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .color-chip {
      width: 80px;
      height: 56px;
      border-radius: 8px;
      display: flex;
      align-items: flex-end;
      padding: 6px;
      font-size: 10px;
      font-weight: 500;
    }

    /* ── FAB stack ── */
    .fab-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    /* ── Progress row ── */
    .progress-demo {
      width: 100%;
      max-width: 400px;
    }

    /* ── Elevation legend ── */
    .elevation-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    .elevation-chip {
      width: 96px;
      height: 56px;
      border-radius: 8px;
      background: var(--md-sys-color-surface-container-low, #F7F2FA);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }

    /* ── Nav bar preview ── */
    .nav-preview {
      border: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
      border-radius: 12px;
      overflow: hidden;
      max-width: 560px;
    }

    /* ── App bar preview ── */
    .app-bar-preview {
      border: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
      border-radius: 12px;
      overflow: hidden;
      max-width: 560px;
      margin-bottom: 16px;
    }

    /* ── Selection row ── */
    .control-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 320px;
    }

    /* ── Section divider ── */
    .section-divider {
      height: 1px;
      background: var(--md-sys-color-outline-variant, #CAC4D0);
      margin: 0 0 48px;
    }

    /* ── Hero header ── */
    .hero {
      background: linear-gradient(135deg,
        var(--md-sys-color-primary, #6750A4) 0%,
        var(--md-sys-color-tertiary, #7D5260) 100%);
      color: #fff;
      padding: 48px 24px;
      margin-bottom: 32px;
    }
    .hero-title {
      font-size: 36px;
      font-weight: 400;
      margin: 0 0 8px;
    }
    .hero-sub {
      font-size: 16px;
      opacity: 0.85;
      margin: 0;
    }

    /* ── Rail preview ── */
    .rail-preview {
      border: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
      border-radius: 12px;
      overflow: hidden;
      height: 320px;
      width: 80px;
      display: flex;
    }

    /* ── Search demo ── */
    .search-demo { max-width: 480px; }

    /* ── Segmented demo ── */
    .segmented-demo {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* ── Sheet demo ── */
    .sheet-content-demo {
      font-family: var(--md-sys-typescale-font, 'Roboto', sans-serif);
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
      line-height: 20px;
    }

    /* ── Drawer / sheet preview frames ── */
    .drawer-preview {
      display: flex;
      height: 320px;
      border: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .drawer-preview-body {
      flex: 1;
      padding: 16px 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--md-sys-color-background, #FFFBFE);
    }
    .drawer-preview-body p {
      margin: 0;
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }
    .side-sheet-preview {
      display: flex;
      height: 320px;
      border: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .side-sheet-preview-body {
      flex: 1;
      padding: 16px 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--md-sys-color-background, #FFFBFE);
    }
    .side-sheet-preview-body p {
      margin: 0;
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #49454F);
    }

    /* ── Tooltip demo ── */
    .tooltip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      align-items: center;
      margin-bottom: 12px;
    }
  `);

  return html`
    <div class="page">
      <!-- ── App Bar ─────────────────────────────────────────────── -->
      <md-app-bar
        title="Material Design 3"
        leading-icon="menu"
        :trailing-icons="${['search', 'more_vert']}"
        @action="${(e: CustomEvent<string>) => showSnackbar('Action: ' + e.detail)}"
      ></md-app-bar>

      <!-- ── Main Content ─────────────────────────────────────────── -->
      <div class="main-content">

        <!-- Color Palette -->
        <div class="section">
          <h2 class="section-title">Color System</h2>
          <p class="section-subtitle">Material Design 3 uses a dynamic color system based on tonal palettes.</p>
          <div class="color-grid">
            <div class="color-chip" style="background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary)">Primary</div>
            <div class="color-chip" style="background:var(--md-sys-color-primary-container);color:var(--md-sys-color-on-primary-container)">Primary Container</div>
            <div class="color-chip" style="background:var(--md-sys-color-secondary);color:var(--md-sys-color-on-secondary)">Secondary</div>
            <div class="color-chip" style="background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container)">Secondary Container</div>
            <div class="color-chip" style="background:var(--md-sys-color-tertiary);color:var(--md-sys-color-on-tertiary)">Tertiary</div>
            <div class="color-chip" style="background:var(--md-sys-color-tertiary-container);color:var(--md-sys-color-on-tertiary-container)">Tertiary Container</div>
            <div class="color-chip" style="background:var(--md-sys-color-error);color:var(--md-sys-color-on-error)">Error</div>
            <div class="color-chip" style="background:var(--md-sys-color-surface);border:1px solid var(--md-sys-color-outline-variant);color:var(--md-sys-color-on-surface)">Surface</div>
            <div class="color-chip" style="background:var(--md-sys-color-surface-variant);color:var(--md-sys-color-on-surface-variant)">Surface Variant</div>
            <div class="color-chip" style="background:var(--md-sys-color-inverse-surface);color:var(--md-sys-color-inverse-on-surface)">Inverse</div>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Buttons -->
        <div class="section">
          <h2 class="section-title">Buttons</h2>
          <p class="section-subtitle">Five button variants for different emphasis levels.</p>

          <div class="demo-label">All Variants</div>
          <div class="row">
            <md-button variant="filled"   label="Filled"   @click="${() => showSnackbar('Filled button!')}"></md-button>
            <md-button variant="tonal"    label="Tonal"    @click="${() => showSnackbar('Tonal button!')}"></md-button>
            <md-button variant="elevated" label="Elevated" @click="${() => showSnackbar('Elevated button!')}"></md-button>
            <md-button variant="outlined" label="Outlined" @click="${() => showSnackbar('Outlined button!')}"></md-button>
            <md-button variant="text"     label="Text"     @click="${() => showSnackbar('Text button!')}"></md-button>
          </div>

          <div class="demo-label">With Icons</div>
          <div class="row">
            <md-button variant="filled"   label="Add"     icon="add"     @click="${() => showSnackbar('Add!')}"></md-button>
            <md-button variant="tonal"    label="Send"    icon="send"    @click="${() => showSnackbar('Send!')}"></md-button>
            <md-button variant="outlined" label="Upload"  icon="upload"  @click="${() => showSnackbar('Upload!')}"></md-button>
            <md-button variant="text"     label="Explore" icon="explore" @click="${() => showSnackbar('Explore!')}"></md-button>
          </div>

          <div class="demo-label">Disabled</div>
          <div class="row">
            <md-button variant="filled"   label="Filled"   disabled="true"></md-button>
            <md-button variant="tonal"    label="Tonal"    disabled="true"></md-button>
            <md-button variant="elevated" label="Elevated" disabled="true"></md-button>
            <md-button variant="outlined" label="Outlined" disabled="true"></md-button>
            <md-button variant="text"     label="Text"     disabled="true"></md-button>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- FAB -->
        <div class="section">
          <h2 class="section-title">Floating Action Button</h2>
          <p class="section-subtitle">FABs represent the most important action on a screen.</p>

          <div class="demo-label">Sizes</div>
          <div class="row">
            <md-fab size="small"   icon="add"  @click="${() => showSnackbar('Small FAB!')}"></md-fab>
            <md-fab size="regular" icon="add"  @click="${() => showSnackbar('Regular FAB!')}"></md-fab>
            <md-fab size="large"   icon="add"  @click="${() => showSnackbar('Large FAB!')}"></md-fab>
          </div>

          <div class="demo-label">Extended (with label)</div>
          <div class="row">
            <md-fab icon="add" label="Create" @click="${() => showSnackbar('Create!')}"></md-fab>
            <md-fab icon="edit" label="Edit" @click="${() => showSnackbar('Edit!')}"></md-fab>
          </div>

          <div class="demo-label">Color Variants</div>
          <div class="row">
            <md-fab variant="primary"   icon="star"  @click="${() => showSnackbar('Primary FAB!')}"></md-fab>
            <md-fab variant="secondary" icon="heart_plus" @click="${() => showSnackbar('Secondary FAB!')}"></md-fab>
            <md-fab variant="tertiary"  icon="music_note" @click="${() => showSnackbar('Tertiary FAB!')}"></md-fab>
            <md-fab variant="surface"   icon="brush"  @click="${() => showSnackbar('Surface FAB!')}"></md-fab>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Icon Buttons -->
        <div class="section">
          <h2 class="section-title">Icon Buttons</h2>
          <p class="section-subtitle">Icon buttons help users take supplementary actions.</p>

          <div class="demo-label">Variants</div>
          <div class="row">
            <md-icon-button variant="standard" icon="favorite" @click="${() => showSnackbar('Standard!')}"></md-icon-button>
            <md-icon-button variant="filled"   icon="favorite" @click="${() => showSnackbar('Filled!')}"></md-icon-button>
            <md-icon-button variant="tonal"    icon="favorite" @click="${() => showSnackbar('Tonal!')}"></md-icon-button>
            <md-icon-button variant="outlined" icon="favorite" @click="${() => showSnackbar('Outlined!')}"></md-icon-button>
          </div>

          <div class="demo-label">Selected (toggle) state</div>
          <div class="row">
            <md-icon-button variant="standard" icon="bookmark_border" selected="true"></md-icon-button>
            <md-icon-button variant="filled"   icon="bookmark" selected="true"></md-icon-button>
            <md-icon-button variant="tonal"    icon="thumb_up" selected="true"></md-icon-button>
            <md-icon-button variant="outlined" icon="check" selected="true"></md-icon-button>
          </div>

          <div class="demo-label">Disabled</div>
          <div class="row">
            <md-icon-button variant="standard" icon="delete" disabled="true"></md-icon-button>
            <md-icon-button variant="filled"   icon="delete" disabled="true"></md-icon-button>
            <md-icon-button variant="tonal"    icon="delete" disabled="true"></md-icon-button>
            <md-icon-button variant="outlined" icon="delete" disabled="true"></md-icon-button>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Chips -->
        <div class="section">
          <h2 class="section-title">Chips</h2>
          <p class="section-subtitle">Chips help people enter information, make selections, filter content, or trigger actions.</p>

          <div class="demo-label">Assist Chips</div>
          <div class="row">
            <md-chip variant="assist" label="Add to calendar" icon="event" @click="${() => showSnackbar('Add to calendar')}"></md-chip>
            <md-chip variant="assist" label="Bookmark" icon="bookmark" @click="${() => showSnackbar('Bookmarked!')}"></md-chip>
            <md-chip variant="assist" label="Share" icon="share" @click="${() => showSnackbar('Shared!')}"></md-chip>
          </div>

          <div class="demo-label">Filter Chips</div>
          <div class="row">
            <md-chip
              variant="filter"
              label="Favorites"
              :selected="${filterSelected.value}"
              @click="${() => { filterSelected.value = !filterSelected.value; }}"
            ></md-chip>
            <md-chip variant="filter" label="Slow cooker" selected="true"></md-chip>
            <md-chip variant="filter" label="Spicy" selected="false"></md-chip>
          </div>

          <div class="demo-label">Input Chips</div>
          <div class="row">
            <md-chip variant="input" label="React" icon="code" @remove="${() => showSnackbar('Removed React')}"></md-chip>
            <md-chip variant="input" label="TypeScript" icon="code" @remove="${() => showSnackbar('Removed TypeScript')}"></md-chip>
          </div>

          <div class="demo-label">Suggestion Chips</div>
          <div class="row">
            <md-chip variant="suggestion" label="Machine learning" @click="${() => showSnackbar('ML selected!')}"></md-chip>
            <md-chip variant="suggestion" label="Frontend" @click="${() => showSnackbar('Frontend selected!')}"></md-chip>
            <md-chip variant="suggestion" label="Design" @click="${() => showSnackbar('Design selected!')}"></md-chip>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Cards -->
        <div class="section">
          <h2 class="section-title">Cards</h2>
          <p class="section-subtitle">Cards contain content and actions about a single subject.</p>

          <div class="cards-grid">
            <!-- Elevated card -->
            <md-card variant="elevated" clickable="true" @click="${() => showSnackbar('Elevated card clicked!')}">
              <div class="card-media">landscape</div>
              <div class="card-content">
                <p class="card-title">Elevated Card</p>
                <p class="card-body">Cards are surfaces that display content and actions on a single topic.</p>
                <div class="row">
                  <md-button variant="filled" label="Action" @click="${(e: Event) => { e.stopPropagation(); showSnackbar('Card action!'); }}"></md-button>
                  <md-button variant="text" label="Learn more"></md-button>
                </div>
              </div>
            </md-card>

            <!-- Filled card -->
            <md-card variant="filled" clickable="true">
              <div class="card-media">photo</div>
              <div class="card-content">
                <p class="card-title">Filled Card</p>
                <p class="card-body">Filled cards have filled surfaces separating them from a background.</p>
                <div class="row">
                  <md-button variant="tonal" label="Action"></md-button>
                  <md-button variant="text" label="Dismiss"></md-button>
                </div>
              </div>
            </md-card>

            <!-- Outlined card -->
            <md-card variant="outlined">
              <div class="card-media">image</div>
              <div class="card-content">
                <p class="card-title">Outlined Card</p>
                <p class="card-body">Outlined cards have a stroke surrounding the surface. They can be used when low-contrast theming is desired.</p>
                <div class="row">
                  <md-button variant="outlined" label="View"></md-button>
                  <md-icon-button variant="standard" icon="share"></md-icon-button>
                  <md-icon-button variant="standard" icon="bookmark"></md-icon-button>
                </div>
              </div>
            </md-card>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Text Fields -->
        <div class="section">
          <h2 class="section-title">Text Fields</h2>
          <p class="section-subtitle">Text fields let users enter and edit text.</p>

          <div class="demo-label">Filled Variant</div>
          <div class="row column">
            <md-text-field
              variant="filled"
              label="Email address"
              type="email"
              leading-icon="email"
              supporting-text="We'll never share your email"
              style="max-width:360px;width:100%"
            ></md-text-field>
            <md-text-field
              variant="filled"
              label="Password"
              type="password"
              leading-icon="lock"
              style="max-width:360px;width:100%"
            ></md-text-field>
          </div>

          <div class="demo-label">Outlined Variant</div>
          <div class="row column">
            <md-text-field
              variant="outlined"
              label="First name"
              leading-icon="person"
              style="max-width:360px;width:100%"
            ></md-text-field>
            <md-text-field
              variant="outlined"
              label="Search"
              leading-icon="search"
              trailing-icon="mic"
              style="max-width:360px;width:100%"
            ></md-text-field>
          </div>

          <div class="demo-label">Error State</div>
          <div class="row column">
            <md-text-field
              variant="outlined"
              label="Username"
              value="taken_user"
              error="true"
              error-text="This username is already taken"
              style="max-width:360px;width:100%"
            ></md-text-field>
          </div>

          <div class="demo-label">Disabled</div>
          <div class="row column">
            <md-text-field
              variant="filled"
              label="Disabled field"
              value="Cannot edit"
              disabled="true"
              style="max-width:360px;width:100%"
            ></md-text-field>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Selection Controls -->
        <div class="section">
          <h2 class="section-title">Selection Controls</h2>
          <p class="section-subtitle">Checkboxes, radio buttons, and switches for selecting options.</p>

          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:24px;">
            <!-- Checkbox -->
            <div>
              <div class="demo-label">Checkbox</div>
              <div class="control-row">
                <md-checkbox
                  label="Checked"
                  :checked="${checkState.value}"
                  @change="${(e: CustomEvent<boolean>) => { checkState.value = e.detail; }}"
                ></md-checkbox>
                <md-checkbox label="Unchecked" checked="false"></md-checkbox>
                <md-checkbox label="Indeterminate" indeterminate="true"></md-checkbox>
                <md-checkbox label="Disabled checked" checked="true" disabled="true"></md-checkbox>
                <md-checkbox label="Disabled unchecked" disabled="true"></md-checkbox>
              </div>
            </div>

            <!-- Radio -->
            <div>
              <div class="demo-label">Radio Button</div>
              <div class="control-row">
                <md-radio
                  label="Option 1"
                  name="demo-radio"
                  value="option1"
                  :checked="${radioValue.value === 'option1'}"
                  @change="${(e: CustomEvent<string>) => { radioValue.value = e.detail; }}"
                ></md-radio>
                <md-radio
                  label="Option 2"
                  name="demo-radio"
                  value="option2"
                  :checked="${radioValue.value === 'option2'}"
                  @change="${(e: CustomEvent<string>) => { radioValue.value = e.detail; }}"
                ></md-radio>
                <md-radio
                  label="Option 3"
                  name="demo-radio"
                  value="option3"
                  :checked="${radioValue.value === 'option3'}"
                  @change="${(e: CustomEvent<string>) => { radioValue.value = e.detail; }}"
                ></md-radio>
                <md-radio label="Disabled" disabled="true"></md-radio>
              </div>
            </div>

            <!-- Switch -->
            <div>
              <div class="demo-label">Switch</div>
              <div class="control-row">
                <div style="display:flex;align-items:center;gap:12px">
                  <md-switch
                    :selected="${switchSelected.value}"
                    @change="${(e: CustomEvent<boolean>) => { switchSelected.value = e.detail; }}"
                  ></md-switch>
                  <span style="font-size:14px">${switchSelected.value ? 'On' : 'Off'}</span>
                </div>
                <div style="display:flex;align-items:center;gap:12px">
                  <md-switch selected="true" icons="true"></md-switch>
                  <span style="font-size:14px">With icons (on)</span>
                </div>
                <div style="display:flex;align-items:center;gap:12px">
                  <md-switch icons="true"></md-switch>
                  <span style="font-size:14px">With icons (off)</span>
                </div>
                <div style="display:flex;align-items:center;gap:12px">
                  <md-switch selected="true" disabled="true"></md-switch>
                  <span style="font-size:14px">Disabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Sliders -->
        <div class="section">
          <h2 class="section-title">Sliders</h2>
          <p class="section-subtitle">Sliders allow users to make selections from a range of values.</p>

          <div class="demo-label">Continuous (value: ${sliderValue.value})</div>
          <div class="progress-demo">
            <md-slider
              :value="${sliderValue.value}"
              @change="${(e: CustomEvent<number>) => { sliderValue.value = e.detail; }}"
            ></md-slider>
          </div>

          <div class="demo-label">With value label</div>
          <div class="progress-demo">
            <md-slider value="65" labeled="true"></md-slider>
          </div>

          <div class="demo-label">Stepped (step=10)</div>
          <div class="progress-demo">
            <md-slider value="30" step="10" ticks="true"></md-slider>
          </div>

          <div class="demo-label">Disabled</div>
          <div class="progress-demo">
            <md-slider value="50" disabled="true"></md-slider>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Progress Indicators -->
        <div class="section">
          <h2 class="section-title">Progress Indicators</h2>
          <p class="section-subtitle">Progress indicators express an unspecified wait time or display the length of a process.</p>

          <div class="demo-label">Linear — Determinate (60%)</div>
          <div class="progress-demo">
            <md-progress variant="linear" value="60"></md-progress>
          </div>

          <div class="demo-label">Linear — Indeterminate</div>
          <div class="progress-demo">
            <md-progress variant="linear" indeterminate="true"></md-progress>
          </div>

          <div class="demo-label">Circular</div>
          <div class="row">
            <md-progress variant="circular" value="75"></md-progress>
            <md-progress variant="circular" value="30"></md-progress>
            <md-progress variant="circular" indeterminate="true"></md-progress>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Dialogs -->
        <div class="section">
          <h2 class="section-title">Dialogs</h2>
          <p class="section-subtitle">Dialogs provide important prompts in a user flow.</p>

          <div class="row">
            <md-button
              variant="filled"
              label="Open Dialog"
              icon="open_in_new"
              @click="${() => { dialogOpen.value = true; }}"
            ></md-button>
          </div>

          <md-dialog
            :open="${dialogOpen.value}"
            headline="Save changes?"
            icon="save"
            @close="${() => { dialogOpen.value = false; }}"
          >
            Your unsaved changes will be lost if you navigate away from this page before saving.
            <span slot="actions">
              <md-button variant="text" label="Discard" @click="${() => { dialogOpen.value = false; showSnackbar('Changes discarded'); }}"></md-button>
              <md-button variant="filled" label="Save" @click="${() => { dialogOpen.value = false; showSnackbar('Changes saved!'); }}"></md-button>
            </span>
          </md-dialog>
        </div>
        <div class="section-divider"></div>

        <!-- Snackbars -->
        <div class="section">
          <h2 class="section-title">Snackbars</h2>
          <p class="section-subtitle">Snackbars provide brief, non-intrusive messages about app processes.</p>

          <div class="row">
            <md-button variant="filled" label="Show Snackbar" @click="${() => showSnackbar('This is a snackbar message!')}"></md-button>
            <md-button variant="tonal" label="With Action" @click="${() => showSnackbar('Item deleted')}"></md-button>
          </div>

          <md-snackbar
            :open="${snackbarOpen.value}"
            :message="${snackbarMsg.value}"
            action-label="Undo"
            @action="${() => showSnackbar('Undone!')}"
            @close="${closeSnackbar}"
          ></md-snackbar>
        </div>
        <div class="section-divider"></div>

        <!-- Tabs -->
        <div class="section">
          <h2 class="section-title">Tabs</h2>
          <p class="section-subtitle">Tabs organize content across different screens and views.</p>

          <div class="demo-label">Primary Tabs (with icons)</div>
          <md-tabs
            variant="primary"
            :tabs="${tabs1}"
            @tab-change="${(e: CustomEvent<string>) => showSnackbar('Tab: ' + e.detail)}"
          ></md-tabs>

          <div class="demo-label">Secondary Tabs</div>
          <md-tabs
            variant="secondary"
            :tabs="${[
              { id: 'a', label: 'All' },
              { id: 'b', label: 'Purchased' },
              { id: 'c', label: 'Downloads' },
            ]}"
          ></md-tabs>
        </div>
        <div class="section-divider"></div>

        <!-- Lists -->
        <div class="section">
          <h2 class="section-title">Lists</h2>
          <p class="section-subtitle">Lists are continuous, vertical indexes of text or images.</p>

          <md-list>
            <md-list-item
              headline="Inbox"
              supporting-text="3 unread messages"
              leading-icon="inbox"
              trailing-icon="chevron_right"
              @click="${() => showSnackbar('Inbox')}"
            ></md-list-item>
            <md-divider></md-divider>
            <md-list-item
              headline="Sent"
              supporting-text="12 messages"
              leading-icon="send"
              trailing-supporting-text="12"
              @click="${() => showSnackbar('Sent')}"
            ></md-list-item>
            <md-divider></md-divider>
            <md-list-item
              headline="Drafts"
              leading-icon="drafts"
              trailing-icon="chevron_right"
              @click="${() => showSnackbar('Drafts')}"
            ></md-list-item>
            <md-divider></md-divider>
            <md-list-item
              headline="Starred"
              leading-icon="star"
              selected="true"
              @click="${() => showSnackbar('Starred')}"
            ></md-list-item>
            <md-divider></md-divider>
            <md-list-item
              headline="Trash"
              leading-icon="delete"
              disabled="true"
            ></md-list-item>
          </md-list>
        </div>
        <div class="section-divider"></div>

        <!-- Badges -->
        <div class="section">
          <h2 class="section-title">Badges</h2>
          <p class="section-subtitle">Badges show notifications, counts, or status information.</p>

          <div class="row">
            <md-badge value="3">
              <md-icon-button variant="standard" icon="notifications"></md-icon-button>
            </md-badge>

            <md-badge value="99+">
              <md-icon-button variant="tonal" icon="email"></md-icon-button>
            </md-badge>

            <md-badge small="true">
              <md-icon-button variant="standard" icon="chat"></md-icon-button>
            </md-badge>

            <md-badge value="New">
              <md-button variant="outlined" label="Updates"></md-button>
            </md-badge>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Dividers -->
        <div class="section">
          <h2 class="section-title">Dividers</h2>
          <p class="section-subtitle">Dividers are thin lines that group content in lists and layouts.</p>

          <div class="demo-label">Full-width</div>
          <md-divider></md-divider>

          <div style="margin-top:12px">
            <div class="demo-label">Inset Start</div>
            <md-divider inset-start="true"></md-divider>
          </div>

          <div style="margin-top:12px">
            <div class="demo-label">Inset (both sides)</div>
            <md-divider inset="true"></md-divider>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Menu -->
        <div class="section">
          <h2 class="section-title">Menus</h2>
          <p class="section-subtitle">Menus display a list of choices on temporary surfaces.</p>

          <div class="row">
            <md-menu
              :open="${menuOpen.value}"
              :items="${menuItems}"
              @select="${(e: CustomEvent<string>) => showSnackbar('Menu: ' + e.detail)}"
              @close="${() => { menuOpen.value = false; }}"
            >
              <md-button
                slot="trigger"
                variant="outlined"
                label="Open Menu"
                icon="expand_more"
                @click="${() => { menuOpen.value = !menuOpen.value; }}"
              ></md-button>
            </md-menu>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Navigation Bar -->
        <div class="section">
          <h2 class="section-title">Navigation Bar</h2>
          <p class="section-subtitle">Navigation bars let users switch between primary destinations in an app.</p>

          <div class="nav-preview">
            <md-navigation-bar
              :items="${navItems}"
              :active="${activeNav.value}"
              @change="${(e: CustomEvent<string>) => { activeNav.value = e.detail; showSnackbar('Nav: ' + e.detail); }}"
            ></md-navigation-bar>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- App Bar Variants -->
        <div class="section">
          <h2 class="section-title">App Bars</h2>
          <p class="section-subtitle">Top app bars display information and actions at the top of a screen.</p>

          <div class="demo-label">Small (default)</div>
          <div class="app-bar-preview">
            <md-app-bar title="Small App Bar" leading-icon="arrow_back" :trailing-icons="${['search', 'more_vert']}"></md-app-bar>
          </div>

          <div class="demo-label">Center-aligned</div>
          <div class="app-bar-preview">
            <md-app-bar variant="center" title="Center" leading-icon="arrow_back" :trailing-icons="${['more_vert']}"></md-app-bar>
          </div>

          <div class="demo-label">Medium</div>
          <div class="app-bar-preview">
            <md-app-bar variant="medium" title="Medium App Bar" leading-icon="arrow_back" :trailing-icons="${['attach_file', 'today', 'more_vert']}"></md-app-bar>
          </div>

          <div class="demo-label">Large</div>
          <div class="app-bar-preview">
            <md-app-bar variant="large" title="Large App Bar" leading-icon="arrow_back" :trailing-icons="${['more_vert']}"></md-app-bar>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Typography -->
        <div class="section">
          <h2 class="section-title">Typography</h2>
          <p class="section-subtitle">Material Design 3 type system is based on the Roboto typeface designed specifically for digital interfaces.</p>

          <div class="type-row"><span class="display-large">Display Large (57sp)</span></div>
          <div class="type-row"><span class="display-medium">Display Medium (45sp)</span></div>
          <div class="type-row"><span class="display-small">Display Small (36sp)</span></div>
          <div class="type-row"><span class="headline-large">Headline Large (32sp)</span></div>
          <div class="type-row"><span class="headline-medium">Headline Medium (28sp)</span></div>
          <div class="type-row"><span class="headline-small">Headline Small (24sp)</span></div>
          <div class="type-row"><span class="title-large">Title Large (22sp)</span></div>
          <div class="type-row"><span class="title-medium">Title Medium (16sp / 500w)</span></div>
          <div class="type-row"><span class="title-small">Title Small (14sp / 500w)</span></div>
          <div class="type-row"><span class="body-large">Body Large (16sp)</span></div>
          <div class="type-row"><span class="body-medium">Body Medium (14sp)</span></div>
          <div class="type-row"><span class="body-small">Body Small (12sp)</span></div>
          <div class="type-row"><span class="label-large">Label Large (14sp / 500w)</span></div>
          <div class="type-row"><span class="label-medium">Label Medium (12sp / 500w)</span></div>
          <div class="type-row"><span class="label-small">Label Small (11sp / 500w)</span></div>
        </div>
        <div class="section-divider"></div>

        <!-- Elevation -->
        <div class="section">
          <h2 class="section-title">Elevation</h2>
          <p class="section-subtitle">Elevation helps express the hierarchy and spatial relationships between components.</p>

          <div class="elevation-row">
            <div class="elevation-chip" style="box-shadow:none;border:1px solid var(--md-sys-color-outline-variant)">Level 0</div>
            <div class="elevation-chip" style="box-shadow:var(--md-sys-elevation-1)">Level 1</div>
            <div class="elevation-chip" style="box-shadow:var(--md-sys-elevation-2)">Level 2</div>
            <div class="elevation-chip" style="box-shadow:var(--md-sys-elevation-3)">Level 3</div>
            <div class="elevation-chip" style="box-shadow:var(--md-sys-elevation-4)">Level 4</div>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Search -->
        <div class="section">
          <h2 class="section-title">Search</h2>
          <p class="section-subtitle">The search bar allows users to enter a keyword or phrase to get relevant information.</p>

          <div class="demo-label">Default</div>
          <div class="search-demo">
            <md-search placeholder="Search"></md-search>
          </div>

          <div class="demo-label">With avatar</div>
          <div class="search-demo">
            <md-search placeholder="Search your library" show-avatar="true"></md-search>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Segmented Buttons -->
        <div class="section">
          <h2 class="section-title">Segmented Buttons</h2>
          <p class="section-subtitle">Segmented buttons help people select options, switch views, or sort elements.</p>

          <div class="demo-label">Single select (selected: ${segSelected.value})</div>
          <div class="segmented-demo">
            <md-segmented-button
              :segments="${[
                { id: 'day',   label: 'Day',   icon: 'today' },
                { id: 'week',  label: 'Week',  icon: 'view_week' },
                { id: 'month', label: 'Month', icon: 'calendar_month' },
              ]}"
              :selected="${segSelected.value}"
              @change="${(e: CustomEvent<string>) => { segSelected.value = e.detail; }}"
            ></md-segmented-button>
          </div>

          <div class="demo-label">Icons only</div>
          <div class="row">
            <md-segmented-button
              :segments="${[
                { id: 'list',   icon: 'list' },
                { id: 'grid',   icon: 'grid_view' },
                { id: 'column', icon: 'view_column' },
              ]}"
              selected="list"
            ></md-segmented-button>
          </div>

          <div class="demo-label">Labels only</div>
          <div class="row">
            <md-segmented-button
              :segments="${[
                { id: 'sm', label: 'Small' },
                { id: 'md', label: 'Medium' },
                { id: 'lg', label: 'Large' },
              ]}"
              selected="md"
            ></md-segmented-button>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Tooltips -->
        <div class="section">
          <h2 class="section-title">Tooltips</h2>
          <p class="section-subtitle">Tooltips provide brief, informative messages that appear when users hover over, focus on, or tap an element.</p>

          <div class="demo-label">Plain tooltips</div>
          <div class="tooltip-row">
            <md-tooltip text="Add to favorites">
              <md-icon-button variant="standard" icon="favorite_border"></md-icon-button>
            </md-tooltip>
            <md-tooltip text="Share">
              <md-icon-button variant="standard" icon="share"></md-icon-button>
            </md-tooltip>
            <md-tooltip text="Delete item">
              <md-icon-button variant="standard" icon="delete"></md-icon-button>
            </md-tooltip>
            <md-tooltip text="More options">
              <md-button variant="outlined" label="Hover me"></md-button>
            </md-tooltip>
          </div>

          <div class="demo-label">Rich tooltip</div>
          <div class="tooltip-row">
            <md-tooltip
              variant="rich"
              title="Performance tip"
              text="Enable hardware acceleration for smoother animations and better rendering performance."
              action="Learn more"
              @action="${() => showSnackbar('Learn more clicked')}"
            >
              <md-icon-button variant="tonal" icon="speed"></md-icon-button>
            </md-tooltip>
            <md-tooltip
              variant="rich"
              title="Keyboard shortcut"
              text="Press Ctrl+S to save your work at any time."
            >
              <md-button variant="tonal" label="Save" icon="save"></md-button>
            </md-tooltip>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Navigation Rail -->
        <div class="section">
          <h2 class="section-title">Navigation Rail</h2>
          <p class="section-subtitle">The navigation rail provides access to primary destinations in apps when using tablet and desktop screens.</p>

          <div class="demo-label">Standard (active: ${activeRail.value})</div>
          <div class="rail-preview">
            <md-navigation-rail
              :items="${railItems}"
              :active="${activeRail.value}"
              @change="${(e: CustomEvent<string>) => { activeRail.value = e.detail; showSnackbar('Rail: ' + e.detail); }}"
            ></md-navigation-rail>
          </div>

          <div class="demo-label" style="margin-top:20px">With FAB and menu icon</div>
          <div class="rail-preview">
            <md-navigation-rail
              :items="${railItems}"
              active="explore"
              :fab="${true}"
              fab-icon="edit"
              :menu-icon="${true}"
              @change="${(e: CustomEvent<string>) => showSnackbar('Rail: ' + e.detail)}"
              @fab-click="${() => showSnackbar('FAB clicked')}"
              @menu-click="${() => showSnackbar('Menu clicked')}"
            ></md-navigation-rail>
          </div>
        </div>
        <div class="section-divider"></div>

        <!-- Navigation Drawer -->
        <div class="section">
          <h2 class="section-title">Navigation Drawer</h2>
          <p class="section-subtitle">The navigation drawer provides access to destinations and app functionality, such as switching accounts.</p>

          <div class="demo-label">Standard (in-layout — drawer sits beside content)</div>
          <div class="drawer-preview">
            <md-navigation-drawer
              variant="standard"
              :open="${drawerOpen.value}"
              :items="${drawerItems}"
              :active="${activeDrawer.value}"
              @change="${(e: CustomEvent<string>) => { activeDrawer.value = e.detail; }}"
              @close="${() => { drawerOpen.value = false; }}"
            ></md-navigation-drawer>
            <div class="drawer-preview-body">
              <div class="row" style="margin-bottom:0">
                <md-icon-button variant="standard" icon="menu" @click="${() => { drawerOpen.value = !drawerOpen.value; }}"></md-icon-button>
                <span style="font-size:14px;font-weight:500;color:var(--md-sys-color-on-surface,#1C1B1F)">${activeDrawer.value.charAt(0).toUpperCase() + activeDrawer.value.slice(1)}</span>
              </div>
              <p>Primary content area. The standard navigation drawer sits beside this content in the layout — it doesn't block interaction.</p>
              <p>Toggle the menu icon to open or close the drawer.</p>
            </div>
          </div>

          <div class="demo-label">Modal (overlays content with scrim)</div>
          <div class="row">
            <md-button
              variant="filled"
              label="Open Modal Drawer"
              icon="menu"
              @click="${() => { drawerModalOpen.value = true; }}"
            ></md-button>
          </div>
          <md-navigation-drawer
            variant="modal"
            :open="${drawerModalOpen.value}"
            headline="Mail"
            :items="${drawerItems}"
            :active="${activeDrawer.value}"
            @change="${(e: CustomEvent<string>) => { activeDrawer.value = e.detail; showSnackbar('Drawer: ' + e.detail); }}"
            @close="${() => { drawerModalOpen.value = false; }}"
          ></md-navigation-drawer>
        </div>
        <div class="section-divider"></div>

        <!-- Bottom Sheet -->
        <div class="section">
          <h2 class="section-title">Bottom Sheet</h2>
          <p class="section-subtitle">Bottom sheets are surfaces containing supplementary content that are anchored to the bottom of the screen.</p>

          <div class="row">
            <md-button
              variant="filled"
              label="Open Bottom Sheet"
              icon="vertical_align_bottom"
              @click="${() => { bottomSheetOpen.value = true; }}"
            ></md-button>
          </div>

          <md-bottom-sheet
            :open="${bottomSheetOpen.value}"
            headline="Share"
            @close="${() => { bottomSheetOpen.value = false; }}"
          >
            <div class="sheet-content-demo">
              <div class="row">
                <md-icon-button variant="tonal" icon="link" @click="${() => { bottomSheetOpen.value = false; showSnackbar('Link copied'); }}"></md-icon-button>
                <md-icon-button variant="tonal" icon="mail" @click="${() => { bottomSheetOpen.value = false; showSnackbar('Share via email'); }}"></md-icon-button>
                <md-icon-button variant="tonal" icon="message" @click="${() => { bottomSheetOpen.value = false; showSnackbar('Share via message'); }}"></md-icon-button>
                <md-icon-button variant="tonal" icon="more_horiz"></md-icon-button>
              </div>
              <p>Share this content with others using the options above, or copy the link to share anywhere.</p>
            </div>
          </md-bottom-sheet>
        </div>
        <div class="section-divider"></div>

        <!-- Side Sheet -->
        <div class="section">
          <h2 class="section-title">Side Sheet</h2>
          <p class="section-subtitle">Side sheets are surfaces containing supplementary content or navigation, anchored to the side of the screen.</p>

          <div class="demo-label">Standard (in-layout — sheet sits beside content)</div>
          <div class="row">
            <md-button
              variant="${sideSheetOpen.value ? 'outlined' : 'filled'}"
              label="${sideSheetOpen.value ? 'Close Side Sheet' : 'Open Side Sheet'}"
              icon="view_sidebar"
              @click="${() => { sideSheetOpen.value = !sideSheetOpen.value; }}"
            ></md-button>
          </div>
          <div class="side-sheet-preview">
            <div class="side-sheet-preview-body">
              <div class="row" style="margin-bottom:0">
                <span style="font-size:14px;font-weight:500;color:var(--md-sys-color-on-surface,#1C1B1F)">Search Results</span>
                <md-icon-button variant="standard" icon="tune" @click="${() => { sideSheetOpen.value = !sideSheetOpen.value; }}"></md-icon-button>
              </div>
              <p>Primary content area. The standard side sheet sits beside this content in the layout — it doesn't block interaction.</p>
              <p>Toggle the filter icon to open or close the sheet.</p>
            </div>
            <md-side-sheet
              variant="standard"
              :open="${sideSheetOpen.value}"
              headline="Filters"
              @close="${() => { sideSheetOpen.value = false; }}"
            >
              <div class="sheet-content-demo">
                <div style="display:flex;flex-direction:column;gap:12px">
                  <md-checkbox label="In stock only"></md-checkbox>
                  <md-checkbox label="Free shipping"></md-checkbox>
                  <md-checkbox label="On sale"></md-checkbox>
                </div>
              </div>
            </md-side-sheet>
          </div>

          <div class="demo-label">Modal (overlays content with scrim)</div>
          <div class="row">
            <md-button
              variant="filled"
              label="Open Modal Side Sheet"
              icon="view_sidebar"
              @click="${() => { sideSheetModalOpen.value = true; }}"
            ></md-button>
          </div>
          <md-side-sheet
            variant="modal"
            :open="${sideSheetModalOpen.value}"
            headline="Filters"
            @close="${() => { sideSheetModalOpen.value = false; }}"
          >
            <div class="sheet-content-demo">
              <p style="margin:0 0 16px">Refine your search results using the filters below.</p>
              <div style="display:flex;flex-direction:column;gap:12px">
                <md-checkbox label="In stock only"></md-checkbox>
                <md-checkbox label="Free shipping"></md-checkbox>
                <md-checkbox label="On sale"></md-checkbox>
              </div>
              <div style="margin-top:24px">
                <md-button variant="filled" label="Apply filters" @click="${() => { sideSheetModalOpen.value = false; showSnackbar('Filters applied'); }}"></md-button>
              </div>
            </div>
          </md-side-sheet>
        </div>
        <div class="section-divider"></div>

        <!-- Carousel -->
        <div class="section">
          <h2 class="section-title">Carousel</h2>
          <p class="section-subtitle">Carousels contain a collection of items that can be scrolled on and off screen.</p>

          <div class="demo-label">Multi-browse (default)</div>
          <md-carousel :items="${carouselItems}" variant="multi-browse"></md-carousel>

          <div class="demo-label">Uncontained</div>
          <md-carousel :items="${carouselItems}" variant="uncontained"></md-carousel>

          <div class="demo-label">Full-screen</div>
          <md-carousel :items="${carouselItems}" variant="full-screen"></md-carousel>
        </div>

        <div class="section-divider"></div>

        <!-- Date Picker -->
        <div class="section">
          <h2 class="section-title">Date Picker</h2>
          <p class="section-subtitle">Date pickers let people select a date or range of dates.</p>

          <div class="demo-label">Modal (dialog)</div>
          <div class="row">
            <md-button variant="filled" label="Open Date Picker" icon="calendar_today"
              @click="${() => { datePickerOpen.value = true; }}">
            </md-button>
            ${when(!!datePickerValue.value, () => html`<span style="font-size:14px;color:var(--md-sys-color-on-surface-variant,#49454F)">Selected: ${datePickerValue.value}</span>`)}
          </div>
          <md-date-picker
            variant="dialog"
            :open="${datePickerOpen.value}"
            :value="${datePickerValue.value}"
            @change="${(e: CustomEvent<string>) => { datePickerValue.value = e.detail; }}"
            @close="${() => { datePickerOpen.value = false; }}"
          ></md-date-picker>

          <div class="demo-label">Docked (inline)</div>
          <div style="max-width:380px;min-height:460px;">
            <md-date-picker
              variant="docked"
              open="true"
              :value="${datePickerValue.value}"
              @change="${(e: CustomEvent<string>) => { datePickerValue.value = e.detail; }}"
              @close="${() => {}}"
            ></md-date-picker>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- Time Picker -->
        <div class="section">
          <h2 class="section-title">Time Picker</h2>
          <p class="section-subtitle">Time pickers help users select and set a specific time.</p>

          <div class="demo-label">Dial variant</div>
          <div class="row">
            <md-button variant="filled" label="Open Time Picker (Dial)" icon="schedule"
              @click="${() => { timePickerOpen.value = true; timePickerVariant.value = 'dial'; }}">
            </md-button>
            ${when(!!timePickerValue.value, () => html`<span style="font-size:14px;color:var(--md-sys-color-on-surface-variant,#49454F)">Selected: ${timePickerValue.value}</span>`)}
          </div>

          <div class="demo-label">Input variant</div>
          <div class="row">
            <md-button variant="outlined" label="Open Time Picker (Input)" icon="keyboard"
              @click="${() => { timePickerOpen.value = true; timePickerVariant.value = 'input'; }}">
            </md-button>
          </div>
          <md-time-picker
            :variant="${timePickerVariant.value}"
            :open="${timePickerOpen.value}"
            :value="${timePickerValue.value}"
            @change="${(e: CustomEvent<string>) => { timePickerValue.value = e.detail; }}"
            @close="${() => { timePickerOpen.value = false; }}"
          ></md-time-picker>
        </div>

        <div class="section-divider"></div>

        <!-- Loading Indicator -->
        <div class="section">
          <h2 class="section-title">Loading Indicator</h2>
          <p class="section-subtitle">Loading indicators express an unspecified wait time or display the length of a process.</p>

          <div class="demo-label">Sizes</div>
          <div class="row" style="align-items:center">
            <md-loading-indicator size="small"></md-loading-indicator>
            <md-loading-indicator size="medium"></md-loading-indicator>
            <md-loading-indicator size="large"></md-loading-indicator>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- Button Group -->
        <div class="section">
          <h2 class="section-title">Button Group</h2>
          <p class="section-subtitle">Button groups present multiple related actions together in a horizontally connected row.</p>

          <div class="demo-label">Outlined (default)</div>
          <div class="row">
            <md-button-group
              variant="outlined"
              :items="${[
                { id: 'day',   label: 'Day'   },
                { id: 'week',  label: 'Week'  },
                { id: 'month', label: 'Month' },
              ]}"
              @click="${(e: CustomEvent<{id:string}>) => showSnackbar('Button group: ' + e.detail.id)}"
            ></md-button-group>
          </div>

          <div class="demo-label">Filled with icons</div>
          <div class="row">
            <md-button-group
              variant="filled"
              :items="${[
                { id: 'list',  label: 'List',  icon: 'list'         },
                { id: 'grid',  label: 'Grid',  icon: 'grid_view'    },
                { id: 'table', label: 'Table', icon: 'table_chart'  },
              ]}"
              @click="${(e: CustomEvent<{id:string}>) => showSnackbar('View: ' + e.detail.id)}"
            ></md-button-group>
          </div>

          <div class="demo-label">Tonal</div>
          <div class="row">
            <md-button-group
              variant="tonal"
              :items="${[
                { id: 'bold',      label: 'B'   },
                { id: 'italic',    label: 'I'   },
                { id: 'underline', label: 'U'   },
              ]}"
              @click="${(e: CustomEvent<{id:string}>) => showSnackbar('Format: ' + e.detail.id)}"
            ></md-button-group>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- Split Button -->
        <div class="section">
          <h2 class="section-title">Split Button</h2>
          <p class="section-subtitle">Split buttons combine a primary action with a dropdown for additional related actions.</p>

          <div class="demo-label">Filled</div>
          <div class="row">
            <md-split-button
              variant="filled"
              label="Save"
              icon="save"
              :items="${[
                { id: 'save-copy',  label: 'Save a copy',   icon: 'file_copy' },
                { id: 'save-as',    label: 'Save as…',      icon: 'edit'      },
                { id: 'autosave',   label: 'Autosave',      icon: 'autorenew' },
              ]}"
              @click="${() => showSnackbar('Save clicked!')}"
              @select="${(e: CustomEvent<{id:string}>) => showSnackbar('Split: ' + e.detail.id)}"
            ></md-split-button>
          </div>

          <div class="demo-label">Outlined</div>
          <div class="row">
            <md-split-button
              variant="outlined"
              label="Share"
              icon="share"
              :items="${[
                { id: 'email', label: 'Email link',   icon: 'email'    },
                { id: 'copy',  label: 'Copy link',    icon: 'link'     },
                { id: 'embed', label: 'Embed',        icon: 'code'     },
              ]}"
              @click="${() => showSnackbar('Share clicked!')}"
              @select="${(e: CustomEvent<{id:string}>) => showSnackbar('Share via: ' + e.detail.id)}"
            ></md-split-button>
          </div>

          <div class="demo-label">Tonal</div>
          <div class="row">
            <md-split-button
              variant="tonal"
              label="Export"
              icon="download"
              :items="${[
                { id: 'pdf',  label: 'Export as PDF',  icon: 'picture_as_pdf' },
                { id: 'csv',  label: 'Export as CSV',  icon: 'table_view'     },
                { id: 'json', label: 'Export as JSON', icon: 'data_object'    },
              ]}"
              @click="${() => showSnackbar('Export clicked!')}"
              @select="${(e: CustomEvent<{id:string}>) => showSnackbar('Export as: ' + e.detail.id)}"
            ></md-split-button>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- FAB Menu (Speed Dial) -->
        <div class="section">
          <h2 class="section-title">FAB Menu (Speed Dial)</h2>
          <p class="section-subtitle">The FAB menu (speed dial) is a FAB that expands to show a set of related actions.</p>

          <div class="demo-label">Primary variant</div>
          <div class="row" style="min-height:280px;align-items:flex-end">
            <md-fab-menu
              variant="primary"
              icon="add"
              aria-label="Create new"
              :items="${[
                { id: 'doc',    icon: 'description', label: 'New document' },
                { id: 'sheet',  icon: 'table_chart',  label: 'New spreadsheet' },
                { id: 'slide',  icon: 'slideshow',    label: 'New presentation' },
                { id: 'folder', icon: 'folder',       label: 'New folder' },
              ]}"
              @select="${(e: CustomEvent<{id:string}>) => showSnackbar('Created: ' + e.detail.id)}"
            ></md-fab-menu>

            <md-fab-menu
              variant="secondary"
              icon="share"
              aria-label="Share"
              :items="${[
                { id: 'email',   icon: 'email',    label: 'Email' },
                { id: 'message', icon: 'message',  label: 'Message' },
                { id: 'link',    icon: 'link',     label: 'Copy link' },
              ]}"
              @select="${(e: CustomEvent<{id:string}>) => showSnackbar('Shared via: ' + e.detail.id)}"
            ></md-fab-menu>
          </div>
        </div>

      </div><!-- /main-content -->
    </div><!-- /page -->
  `;
});
