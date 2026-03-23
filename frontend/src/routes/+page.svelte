<script>
  import { onMount } from "svelte";

  let search = $state("");
  let filings = $state([]);
  let selectedFiling = $state(null);
  let stats = $state({
    total: 0,
    companies: 0,
    filers: 0,
    pending: 0,
  });
  function openModal(filing) {
    selectedFiling = filing;
  }

  function closeModal() {
    selectedFiling = null;
  }
  // ✅ pagination
  let currentPage = $state(1);
  const pageSize = 10;

  // onMount(async () => {
  //   const res = await fetch("/api/filings/public");
  //   filings = await res.json();
  // });
  onMount(async () => {
    // filings (approved only)
    const res = await fetch("/api/filings/public");
    filings = await res.json();

    // stats (all filings)
    const statsRes = await fetch("/api/filings/stats");
    stats = await statsRes.json();
  });
  // ✅ safe pagination function (NO reactive issues)
  function getPaginated() {
    const start = (currentPage - 1) * pageSize;
    return filings.slice(start, start + pageSize);
  }

  function totalPages() {
    return Math.ceil(filings.length / pageSize) || 1;
  }
</script>

<!-- SEARCH HERO -->
<div class="search-hero">
  <div class="container">
    <h2>Search Exempt Solicitations</h2>
    <p>
      Browse shareholder exempt solicitations published on the Proxy Open
      Exchange.
    </p>

    <div class="search-box">
      <input
        bind:value={search}
        placeholder="Search by company, filer, CIK, or keyword..."
      />
      <button>Search</button>
    </div>
  </div>
</div>

<!-- MAIN -->
<div class="container main-layout">
  <!-- LEFT TABLE -->
  <div>
    <div class="section-header">
      <h3>Recent Exempt Solicitations</h3>
    </div>

    <!-- ✅ SHOWING TEXT -->
    <p style="margin:10px 0; font-size:13px; color:#666;">
      {#if filings.length === 0}
        Showing 0 filings
      {:else}
        Showing {(currentPage - 1) * pageSize + 1}
        –
        {Math.min(currentPage * pageSize, filings.length)}
        of {filings.length} filings
      {/if}
    </p>

    <table class="filing-table">
      <thead>
        <tr>
          <th>Filed</th>
          <th>Form</th>
          <th>Registrant</th>
          <th>Filer</th>
          <th>Accession</th>
        </tr>
      </thead>

      <!-- <tbody>
        {#if filings.length === 0}
          <tr>
            <td colspan="5">No approved filings yet</td>
          </tr>
        {:else}
          {#each getPaginated() as f}
            <tr>
              <td>{new Date(f.created_at).toLocaleDateString()}</td>

              <td>
                <span class="filing-type">
                  {f.accession_number?.split("-")[0]}
                </span>
              </td>

              <td>{f.company_name}</td>
              <td>{f.filer_name}</td>
              <td class="link">{f.accession_number}</td>
            </tr>
          {/each}
        {/if}
      </tbody> -->
      <tbody>
        {#if filings.length === 0}
          <tr>
            <td colspan="5">No approved filings yet</td>
          </tr>
        {:else}
          {#each getPaginated() as f}
            <tr class="clickable-row" on:click={() => openModal(f)}>
              <!-- DATE -->
              <td>{new Date(f.created_at).toLocaleDateString()}</td>

              <!-- FORM (STATIC) -->
              <td>
                <span class="filing-type">PX14A6G</span>
              </td>

              <!-- REGISTRANT -->
              <td>
                <strong>{f.company_name}</strong><br />
                <span class="sub">CIK: {f.company_cik || "-"}</span>
              </td>

              <!-- FILER -->
              <td>
                {f.filer_name}<br />
                <span class="sub">CIK: {f.filer_cik || "-"}</span>
              </td>

              <!-- ACCESSION -->
              <td class="link">{f.accession_number}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
    {#if selectedFiling}
      <div class="modal-overlay" on:click={closeModal}>
        <div class="modal" on:click|stopPropagation>
          <!-- HEADER -->
          <div class="modal-header">
            <span>{selectedFiling.accession_number}</span>
            <button on:click={closeModal}>×</button>
          </div>

          <div class="modal-body">
            <!-- TAG -->
            <span class="tag">PX14A6G</span>

            <!-- TITLE -->
            <h2 class="modal-title">
              Exempt Solicitation — {selectedFiling.subject}
            </h2>

            <!-- META -->
            <p class="meta">
              Filed {new Date(selectedFiling.created_at).toLocaleDateString()} ·
              {selectedFiling.accession_number}
            </p>

            <hr />

            <!-- FILING INFO -->
            <h4 class="section-title">FILING INFORMATION</h4>

            <div class="info-grid">
              <div class="label">COMPANY</div>
              <div class="value">{selectedFiling.company_name}</div>

              <div class="label">REGISTRANT CIK</div>
              <div class="value">{selectedFiling.company_cik || "-"}</div>

              <div class="label">DEF 14A FILING</div>
              <div class="value">
                <a href={selectedFiling.def14a_link} target="_blank">
                  {selectedFiling.def14a_link}
                </a>
              </div>

              <div class="label">PROPOSAL ITEM</div>
              <div class="value">{selectedFiling.item_number || "-"}</div>

              <div class="label">FILER</div>
              <div class="value">{selectedFiling.filer_name}</div>

              <div class="label">FILER CIK</div>
              <div class="value">{selectedFiling.filer_cik || "-"}</div>

              <div class="label">CONTACT</div>
              <div class="value">
                {selectedFiling.contact_name || "-"} · {selectedFiling.contact_email ||
                  "-"}
              </div>
            </div>

            <hr />

            <!-- FILE -->
            <h4 class="section-title">WRITTEN MATERIALS</h4>

            {#if selectedFiling.pdf_s3_key}
              <div class="file-box">
                📄
                <a href={"/" + selectedFiling.pdf_s3_key} target="_blank">
                  {selectedFiling.pdf_filename}
                </a>
              </div>
            {/if}

            <hr />

            <!-- DESCRIPTION -->
            <h4 class="section-title">DESCRIPTION</h4>
            <p class="desc">{selectedFiling.description}</p>

            <!-- DISCLAIMER -->
            <div class="disclaimer">
              THIS INFORMATION SHOULD NOT BE CONSTRUED AS INVESTMENT ADVICE OR
              AS A SOLICITATION OF AUTHORITY TO VOTE YOUR PROXY.
            </div>
          </div>
        </div>
      </div>
    {/if}
    <!-- ✅ PAGINATION -->
    <div class="pagination">
      <button
        class="pagination-btn"
        disabled={currentPage === 1}
        on:click={() => currentPage--}
      >
        ← Previous
      </button>

      <span class="pagination-text">
        Page {currentPage} / {totalPages()}
      </span>

      <button
        class="pagination-btn"
        disabled={currentPage === totalPages()}
        on:click={() => currentPage++}
      >
        Next →
      </button>
    </div>
  </div>

  <!-- RIGHT SIDEBAR -->
  <div class="sidebar">
    <div class="sidebar-card">
      <div class="sidebar-card-header">Statistics</div>
      <div class="sidebar-card-body">
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-number">{stats.total}</div>
            <div class="stat-label">Total</div>
          </div>

          <div class="stat-item">
            <div class="stat-number">
              {[...new Set(filings.map((f) => f.company_name))].length}
            </div>
            <div class="stat-label">Companies</div>
          </div>

          <div class="stat-item">
            <div class="stat-number">
              {[...new Set(filings.map((f) => f.filer_name))].length}
            </div>
            <div class="stat-label">Filers</div>
          </div>

          <div class="stat-item">
            <div class="stat-number">{stats.pending}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-card">
      <div class="sidebar-card-header">Resources</div>
      <div class="sidebar-card-body">
        <ul class="resource-list">
          <li>
            <a
              href="https://www.sec.gov/about/divisions-offices/division-corporation-finance/proxy-rules-schedules-14a14c-notice-012725"
              target="_blank"
              rel="noopener noreferrer"
            >
              → C&DI Q126.06 — SEC Rule Change
            </a>
          </li>
          <li>
            <a
              href="https://www.sec.gov/submit-filings/forms-index/aboutformsformidpdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              → Register for a CIK Number
            </a>
          </li>

          <li><a href="/about">→ About POE</a></li>
          <li><a href="/terms">→ Terms</a></li>
        </ul>
      </div>
    </div>
  </div>
 
</div>

<style>
  /* CLICKABLE ROW */
  .clickable-row {
    cursor: pointer;
  }
  .clickable-row:hover {
    background: #f9f7f3;
  }

  /* MODAL */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);

    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal {
    position: fixed;
    top: 40px; /* space from top */
    left: 50%;
    transform: translateX(-50%);

    width: 100%;
    max-width: 600px;

    background: #fff;
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);

    max-height: 97vh; /* prevents overflow */
    overflow-y: auto; /* scroll if content is long */
  }
  /* MODAL */
  .modal {
    width: 760px;
    max-height: 90vh;
    background: #f8f6f2;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* HEADER */
  .modal-header {
    background: #1f3b5b;
    color: #fff;
    padding: 14px 20px;
    font-family: var(--mono);
    font-size: 13px;
    display: flex;
    justify-content: space-between;
  }

  /* BODY */
  .modal-body {
    padding: 24px 28px;
    overflow-y: auto;
  }

  /* TAG */
  .tag {
    display: inline-block;
    background: #e6f4ea;
    color: #2f855a;
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: var(--mono);
    margin-bottom: 10px;
  }

  /* TITLE */
  .modal-title {
    font-size: 20px;
    margin: 10px 0;
    color: #1f3b5b;
    font-weight: 600;
  }

  /* META */
  .meta {
    font-size: 16px;
    color: #777;
    margin-bottom: 15px;
  }

  /* SECTION TITLE */
  .section-title {
    font-size: 16px;
    letter-spacing: 1.5px;
    color: #777;
    margin: 20px 0 10px;
    font-family: var(--mono);
  }

  /* GRID */
  .info-grid {
    display: grid;
    grid-template-columns: 180px 1fr;
    row-gap: 10px;
    column-gap: 20px;
  }

  /* LABEL */
  .label {
    font-size: 15px;
    color: #888;
    font-family: var(--mono);
    letter-spacing: 1px;
  }

  /* VALUE */
  .value {
    font-size: 13px;
    color: #222;
  }

  /* LINK */
  .value a {
    color: #2b6cb0;
    text-decoration: none;
  }

  /* FILE */
  .file-box {
    background: #fde8e4;
    padding: 10px 12px;
    border-radius: 6px;
    display: inline-block;
    font-size: 13px;
  }

  /* DESCRIPTION */
  .desc {
    font-size: 13px;
    line-height: 1.6;
    color: #333;
  }

  /* DISCLAIMER */
  .disclaimer {
    margin-top: 20px;
    border: 1px solid #e6d8a8;
    background: #fffbea;
    padding: 12px;
    font-size: 11px;
    color: #6b5e2e;
    border-radius: 4px;
    font-family: var(--mono);
  }
  .modal-body {
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
  }
</style>
