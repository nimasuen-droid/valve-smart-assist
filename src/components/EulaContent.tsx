import {
  APP_GOVERNANCE,
  DATASET_GOVERNANCE_NOTICE,
  STANDARDS_COPYRIGHT_NOTICE,
  USER_RESPONSIBILITY_NOTICE,
} from "@/lib/governance";
import {
  EULA_APP_NAME,
  EULA_EFFECTIVE_DATE,
  EULA_GOVERNING_LAW,
  EULA_LAST_UPDATED,
  EULA_OWNER,
  EULA_SUPPORT_EMAIL,
  EULA_VERSION,
} from "@/lib/eula";

function H({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h3 className="mt-5 mb-1.5 text-sm font-semibold text-foreground">
      {n}. {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{children}</p>;
}

export function EulaContent() {
  return (
    <div className="text-sm">
      <header className="mb-3 border-b border-border pb-3">
        <h2 className="text-base font-semibold">End User License Agreement (EULA)</h2>
        <div className="mt-1 space-y-0.5 font-mono text-[11px] text-muted-foreground">
          <div>Application: {EULA_APP_NAME}</div>
          <div>Owner / Developer: {EULA_OWNER}</div>
          <div>App Version: {APP_GOVERNANCE.appVersion}</div>
          <div>Release ID: {APP_GOVERNANCE.releaseId}</div>
          <div>EULA Version: {EULA_VERSION}</div>
          <div>
            Effective Date: {EULA_EFFECTIVE_DATE} - Last Updated: {EULA_LAST_UPDATED}
          </div>
        </div>
      </header>

      <P>
        This End User License Agreement is a binding agreement between you and {EULA_OWNER}
        governing your use of {EULA_APP_NAME}. If you do not agree, you must not use the software.
      </P>

      <H n={1}>License Grant</H>
      <P>
        Subject to this agreement, the owner grants you a limited, non-exclusive, non-transferable,
        revocable license to use the software for internal engineering screening, training, and
        decision-support purposes.
      </P>

      <H n={2}>Engineering Use Limitation</H>
      <P>
        <strong className="text-foreground">{APP_GOVERNANCE.classification}</strong>
      </P>
      <P>{USER_RESPONSIBILITY_NOTICE}</P>
      <P>
        The software does not provide certified engineering approval, procurement authority,
        fabrication authority, safety approval, or substitution for qualified engineering review.
      </P>

      <H n={3}>Standards and Copyrighted Data</H>
      <P>{STANDARDS_COPYRIGHT_NOTICE}</P>
      <P>{DATASET_GOVERNANCE_NOTICE}</P>

      <H n={4}>User-Owned and Imported Data</H>
      <P>
        User-imported ASME, API, company, or project datasets remain user-owned or user-authorized
        data. The user organization is responsible for licensing, source control, approval status,
        accuracy, and continued validity before project use.
      </P>

      <H n={5}>Local Storage and Privacy</H>
      <P>
        Selection inputs, saved reports, imported datasets, and acceptance records are stored
        locally in this browser unless a future cloud feature is explicitly enabled and governed by
        an approved privacy policy.
      </P>

      <H n={6}>No Warranties</H>
      <P>
        THE SOFTWARE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS,
        IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, ACCURACY, RELIABILITY, OR NON-INFRINGEMENT.
      </P>

      <H n={7}>Limitation of Liability</H>
      <P>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE OWNER SHALL NOT BE LIABLE FOR DIRECT, INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING FROM USE OF THE
        SOFTWARE, INCLUDING DESIGN ERRORS, INCORRECT VALVE SELECTION, PROJECT DELAYS, FINANCIAL
        LOSS, EQUIPMENT FAILURE, PERSONAL INJURY, ENVIRONMENTAL DAMAGE, OR PROPERTY DAMAGE.
      </P>

      <H n={8}>Updates and Acceptance</H>
      <P>
        The owner may update the software, governance wording, reference logic, datasets, or this
        agreement. Continued use after a material update may require renewed acceptance.
      </P>

      <H n={9}>Governing Law and Contact</H>
      <P>
        This agreement is governed by the laws of the {EULA_GOVERNING_LAW}. For support, legal
        notices, defects, or dataset questions, contact{" "}
        <a href={`mailto:${EULA_SUPPORT_EMAIL}`} className="text-primary hover:underline">
          {EULA_SUPPORT_EMAIL}
        </a>
        .
      </P>

      <p className="mt-4 border-t border-border pt-3 text-[10px] italic text-muted-foreground">
        Copyright {new Date().getFullYear()} {EULA_OWNER}. All rights reserved.
      </p>
    </div>
  );
}
