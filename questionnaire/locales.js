// questionnaire/locales.js

const i18n = {
    fr: {
        consentement_titre: "Formulaire de consentement",
        consentement_intro: "Veuillez lire attentivement les informations suivantes avant de participer à l'étude.",
        consentement_texte: `
            <h3>Présentation du chercheur</h3>
            <p>Cette recherche est réalisée dans le cadre d'une subvention du Conseil de recherche en sciences naturelles et en génie, dirigée par Alexandre Marois, professeur adjoint à l'École de psychologie de l'Université Laval et directeur du Laboratoire d'études interdisciplinaires sur les limites et l'augmentation humaines (LEILAH).</p>
            
            <h3>Introduction</h3>
            <p>Avant d'accepter de participer à cette étude, veuillez prendre le temps de lire et de comprendre les renseignements qui suivent. Ce document vous explique le but de cette recherche, ses procédures, avantages et inconvénients. Si vous avez des questions sur la recherche ou sur les implications de votre participation, veuillez communiquer avec le laboratoire par courriel au <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>
            
            <h3>Nature de l'étude</h3>
            <p>La recherche vise à mieux comprendre la façon dont les individus interagissent avec des technologies de l'information pour la recherche documentaire, plus spécifiquement des technologies web.</p>
            
            <h3>Déroulement de la participation</h3>
            <p>Une fois cette fiche de consentement lue, vous serez amené(e) à remplir une fiche sur laquelle vous devez préciser quelques-unes de vos caractéristiques sociodémographiques. Nous vous demanderons ensuite d'effectuer une tâche de recherche documentaire. Pour ce faire, nous vous inviterons à répondre à des questions à développement long sur différents sujets de culture générale.</p>
            <p>Afin de vous soutenir dans votre tâche, vous serez encouragé(e) à utiliser des moteurs de recherche classiques (p. ex. Google). Nous vous demandons de <strong>ne pas utiliser d'outil d'intelligence artificielle</strong> (p. ex. Gemini, ChatGPT ou Copilot) pour réaliser la tâche. Votre navigation sera enregistrée tout au long de l'étude et, conséquemment, l'équipe de recherche devra invalider vos données si vous utilisez ces outils.</p>
            <p>Après chacune des questions à développement long, quelques questions vous seront posées quant aux processus que vous avez mis en branle lors de la recherche d'information que vous avez effectuée. À la fin, vous aurez également à remplir deux autres questionnaires par rapport à votre expérience.</p>
            <p>Vos questionnaires ne seront considérés comme complets que si vous consentez à participer à la recherche en sélectionnant l'option correspondante.</p>
            
            <h3>Avantages et inconvénients</h3>
            <p>Un avantage à cette étude est que vous contribuerez aux avancements des connaissances liées à l'usage des technologies de l'information afin de soutenir la performance humaine. Ce projet permettra de mettre en lumière les processus mis en branle lors de la recherche documentaire. L'étude permettra aussi de valider et de produire des normes de réponse pour les différentes questions auxquelles vous répondrez.</p>
            <p>Un inconvénient à ce projet est l'induction d'une certaine fatigue cognitive. Vous aurez en effet à effectuer un effort mental modéré pendant environ 60 min. Le temps consacré au projet peut également représenter un inconvénient. Vous aurez la possibilité de prendre une pause à tout moment si la fatigue que vous ressentez devient trop difficile mais vous devrez tout de même terminer l'étude en une seule période.</p>
            
            <h3>Participation volontaire et droit de retrait</h3>
            <p>Vous êtes libre de participer ou non à cette étude. Le simple retour du questionnaire rempli sera considéré comme l'expression implicite de votre consentement à participer au projet. Si vous désirez vous retirer de l'étude une fois le questionnaire soumis, veuillez communiquer avec le laboratoire par courriel au <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. Nous pourrons retirer vos résultats sans préjudice, en gardant votre compensation et sans avoir à justifier votre décision.</p>
            
            <h3>Confidentialité et gestion des données</h3>
            <p>Les données recueillies pendant cette étude sont entièrement confidentielles et ne pourront en aucun cas mener à votre identification. Votre confidentialité sera assurée par l'attribution d'un code numérique qui ne figure pas au présent formulaire à toutes les données de recherche collectées. Les données ne seront accessibles qu'aux membres de l'équipe de recherche, chacun d'eux ayant signé un engagement à la confidentialité.</p>
            <p>Les données seront conservées par l'équipe de recherche pour utilisation ultérieure sous forme codée de manière irréversible dans une base de données anonyme, c'est-à-dire à la suite de la destruction du matériel de recherche (liste de nom des personnes participantes et tout document permettant de les identifier), jusqu'au plus tard en <strong>décembre 2035</strong>. Les résultats de la recherche, qui pourront être diffusés sous forme d'article scientifique, de rapport de recherche, de présentation à un congrès scientifique et/ou d'une thèse doctorale, ne permettront pas d'identifier les personnes participantes.</p>
            
            <h3>Renseignements supplémentaires et plaintes</h3>
            <p>Si vous avez des questions, communiquez au <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. Toute plainte sur cette étude pourra être adressée au Bureau de l'Ombudsman de l'Université Laval : Pavillon Alphonse-Desjardins, bureau 3320, 2325 rue de l'Université, Québec G1V 0A6. Ligne sans frais : 1 866 323-2271. Courriel : <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a></p>
        `,

        debriefing_titre: "Debriefing & Consentement post-expérimental",
        debriefing_texte: `
            <p>Au cours de l'expérience, vous avez eu à répondre à des questions à développement long à partir de recherches Web que vous avez effectuées. À la fin de l'expérience, vous avez eu à répondre à des questions de mémorisation en lien avec les sujets abordés. L'objectif de l'étude vous a donc été dissimulé.</p>
            <p>L'objectif caché de l'étude était en fait de voir si votre stratégie de recherche documentaire affecterait votre performance de mémorisation à ce test de mémoire surprise. La raison de cette dissimulation était que nous voulions nous assurer que vous n'utilisiez pas de stratégie de rétention particulière afin de pouvoir évaluer les effets de votre recherche web. Cette connaissance aurait pu modifier vos comportements et réactions face à la tâche.</p>
            <p>Vous connaissez maintenant le but réel de la présente étude. Sachez qu'à la lumière de cette nouvelle information, vous pouvez encore vous retirer de l'étude et ce, sans préjudice. Le cas échéant, vos données seront détruites et ne seront donc pas utilisées. Nous détruirons également tous les autres documents vous liant à la présente étude, notamment le formulaire de consentement que vous avez signé plus tôt.</p>
            <p style="font-size:0.8em; color:#64748b; margin-top:20px;">Ce projet a été approuvé par le Comité d’éthique de la recherche de l’Université Laval : No d’approbation 2025-460 A-1 / 04-05-2026.</p>
        `,

        fin_texte: `
            <div style="margin-top:32px; padding:24px; background:#fef2f2; border:1px solid #fecaca; border-radius:12px; text-align:left;">
                <h3 style="margin:0 0 12px; font-size:16px; color:#dc2626;">Dernière étape : désinstaller l'extension</h3>
                <p style="font-size:14px; color:#475569; line-height:1.6; margin-bottom:16px;">L'étude est terminée. Pour désinstaller l'extension :</p>
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
                    <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">
                        <div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">1</div>
                        <p style="margin:0;font-size:14px;color:#334155;">Faites un <strong>clic droit</strong> sur l'icône de l'extension en haut à droite de Chrome.</p>
                    </div>
                    <div style="display:flex; gap:10px; align-items:flex-start;">
                        <div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">2</div>
                        <p style="margin:0;font-size:14px;color:#334155;">Cliquez sur <strong style="color:#ef4444;">"Supprimer de Chrome"</strong> puis confirmez.</p>
                    </div>
                </div>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">
                <h4 style="margin:0 0 12px; font-size:14px; color:#475569;">Méthode alternative</h4>
                <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
                    <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">
                        <div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">1</div>
                        <p style="margin:0;font-size:14px;color:#334155;">Copiez et collez cette adresse dans votre barre d'adresse : <span style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;padding:2px 8px;font-family:monospace;font-size:13px;color:#3b82f6;">chrome://extensions</span></p>
                    </div>
                    <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">
                        <div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">2</div>
                        <p style="margin:0;font-size:14px;color:#334155;">Trouvez <strong>"Étude Navigation Web - Université Laval"</strong> dans la liste.</p>
                    </div>
                    <div style="display:flex; gap:10px; align-items:flex-start;">
                        <div style="width:26px;height:26px;min-width:26px;background:#3b82f6;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;">3</div>
                        <p style="margin:0;font-size:14px;color:#334155;">Cliquez sur <strong>"Supprimer"</strong> puis confirmez.</p>
                    </div>
                </div>
            </div>
            <div style="margin-top:20px; padding:16px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; text-align:left;">
                <p style="font-size:13px; color:#0369a1; margin:0; line-height:1.5;"><strong>Confidentialité :</strong> Vos données sont anonymisées et chiffrées. Aucune donnée personnelle identifiable n'est conservée. Pour toute question : <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a></p>
            </div>
        `,

        q_connaissance_titre: "Niveau de connaissance de base",
        q_connaissance_item: "Sur une échelle de 0 à 100, j’estime ma connaissance initiale par rapport au sujet de la question au niveau suivant :",

        q_confiance_titre: "Confiance envers la réponse et les sources",
        q_confiance_legende: "Veuillez indiquer votre niveau d'accord avec les énoncés suivants (1 = Fortement en désaccord, 5 = Fortement en accord) :",
        q_confiance_items: [
            "J’ai confiance en la réponse que j’ai offerte à la question présentée.",
            "J’ai utilisé des informations issues de sources numériques pour répondre à la question présentée.",
            "J’ai confiance en la source numérique que j’ai utilisée pour répondre à la question."
        ],

        q_nasa_titre: "Évaluation de la tâche",
        q_nasa_legende: "Veuillez évaluer votre expérience sur une échelle de 1 (faible) à 100 (forte) :",
        q_nasa_items: [
            { id: "tlx_mental", titre: "EXIGENCE MENTALE", desc: "Dans quelle mesure des opérations mentales et perceptives ont-elles été requises (p. ex. : penser, décider, calculer, se rappeler, regarder, chercher, etc.) ?" },
            { id: "tlx_phys", titre: "EXIGENCE PHYSIQUE", desc: "Dans quelle mesure des opérations physiques ont-elles été requises (p. ex. : pousser, tirer, tourner, superviser, activer, etc.) ?" },
            { id: "tlx_temp", titre: "EXIGENCE TEMPORELLE", desc: "Quelle était la pression temporelle que vous avez ressentie, que ce soit à cause de la cadence ou de l’allure des tâches ou de l’apparition des éléments de la tâche ?" },
            { id: "tlx_effort", titre: "EFFORT", desc: "Quelle a été la difficulté d’accomplir (mentalement et physiquement) la tâche avec un niveau de performance tel que le vôtre ?" },
            { id: "tlx_perf", titre: "PERFORMANCE", desc: "Quelle réussite vous attribuez-vous en ce qui concerne l’atteinte des buts de la tâche fixés par l’expérimentatrice (ou par vous-même) ?" },
            { id: "tlx_frust", titre: "FRUSTRATION", desc: "Au cours de la tâche, quel sentiment de manque d'assurance, de découragement, d'irritabilité, de stress ou d'agacement avez-vous ressenti contrairement au fait d’être certain.e, satisfait.e, content.e, détendu.e et complaisant.e ?" }
        ],

        q_internet_titre: "Évaluation",
        q_internet_legende: "Veuillez indiquer à quel point ces énoncés vous correspondent (1 = Ne me correspond pas du tout, 5 = Me correspond beaucoup) :",
        q_internet_items: [
            "Je sais comment télécharger des fichiers.",
            "Je sais comment télécharger/sauvegarder des photos trouvées en ligne.",
            "Je sais comment utiliser les raccourcis clavier (p. ex. CTRL-C pour copier, CTRL-S pour sauvegarder).",
            "Je sais comment ouvrir un nouvel onglet sur mon fureteur internet.",
            "Je sais comment mettre un signet à un site internet.",
            "Je sais où cliquer pour aller sur une page internet différente.",
            "J’ai de la difficulté à trouver les meilleurs mots-clés pour la recherche en ligne.",
            "J’ai de la difficulté à trouver un site internet que j’ai déjà visité.",
            "Je me fatigue rapidement lorsque je cherche de l’information sur internet.",
            "Parfois, je me surprends à naviguer sur un site internet sans réellement savoir comment je m’y suis rendu.",
            "Je suis parfois confus.e de la façon dont les sites internet sont conçus.",
            "Je devrais suivre un cours sur la façon de rechercher de l’information sur internet.",
            "Parfois, je trouve qu’il est difficile de vérifier des informations trouvées en ligne.",
            "Je sais quelles informations je devrais partager et lesquelles je ne devrais pas partager en ligne.",
            "Je sais quand partager et quand ne pas partager d’informations en ligne.",
            "Je m’assure que mes commentaires et comportements en ligne sont appropriés à la situation.",
            "Je sais comment changer les personnes avec qui je partage de l’information en ligne (p. ex. ami.e.s, ami.e.s de mes ami.e.s, public).",
            "Je sais comment enlever des gens de mes listes d’ami.e.s.",
            "Je sais comment créer du nouveau contenu à partir d’images, de musique ou de vidéos trouvés sur le web.",
            "Je sais comment effectuer des changements mineurs au contenu que d’autres ont produit.",
            "Je sais comment concevoir un site web.",
            "Je suis à l'aise avec les différents types de licence qui s’appliquent au contenu en ligne.",
            "Je serais confiant.e de mettre en ligne une vidéo que j’ai créée.",
            "Je sais comment installer une application sur un appareil mobile.",
            "Je sais comment télécharger une application sur mon appareil mobile.",
            "Je sais comment suivre les coûts d’usage des applications mobiles."
        ]
    }
};