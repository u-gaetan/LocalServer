const i18n = {
    fr: {
        // --- Phase de Langue ---
        langue_titre: "Langue préférentielle / Preferred Language",
        langue_select_default: "-- Sélectionnez / Select --",
        btn_continuer: "Continuer / Continue",

        // --- Consentement ---
        consentement_titre: "Formulaire de consentement",
        consentement_intro: "Veuillez lire attentivement les informations suivantes avant de participer à l'étude.",
        consentement_checkbox: "J'ai lu et compris les informations ci-dessus et je souhaite participer à l'étude. Je confirme être âgé(e) de 18 ans ou plus.",
        btn_consentement_accepter: "J'accepte et je souhaite participer",
        btn_consentement_refuser: "Je ne souhaite pas participer",
        consentement_refuse_titre: "Merci",
        consentement_refuse_texte: "Nous comprenons votre décision. Vous pouvez fermer cette page.",
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

        // --- Démographie ---
        demo_titre: "Informations personnelles",
        demo_description: "Votre adresse courriel est uniquement requise pour vous contacter concernant votre méthode de compensation financière, ainsi que pour nous permettre de retrouver et supprimer vos données si vous décidez de retirer votre consentement plus tard. Elle sera conservée de manière sécurisée et dissociée de vos données de navigation.",
        demo_email: "Adresse courriel",
        demo_age: "Âge",
        demo_maitrise_langue: "Niveau de maîtrise de la langue de l'étude",
        demo_select_default: "-- Sélectionnez --",
        demo_lang_debutant: "Débutant",
        demo_lang_intermediaire: "Intermédiaire",
        demo_lang_expert: "Expert",
        demo_lang_natif: "Langue maternelle (Natif)",
        demo_scolarite: "Niveau d'études",
        demo_scol_secondaire: "Secondaire",
        demo_scol_cegep: "Cégep / DEC",
        demo_scol_bac: "Baccalaureat",
        demo_scol_maitrise: "Maîtrise",
        demo_scol_doctorat: "Doctorat",
        demo_scol_autre: "Autre",
        demo_compensation: "Comment souhaitez-vous recevoir votre compensation ?",
        demo_pay_interac: "Virement Interac (courriel ci-dessus)",
        demo_pay_pickup: "Venir chercher à l'Université Laval",
        demo_pay_cheque: "Chèque par la poste",
        demo_err_champs: "Veuillez remplir tous les champs.",
        btn_suivant: "Suivant",

        // --- Instructions ---
        instr_titre: "Instructions",
        instr_texte: "Vous allez répondre à <strong>{count} questions de recherche</strong>.",
        instr_item_1: "<strong>Naviguez librement</strong> dans d'autres onglets (Google, Wikipédia, etc.) pour trouver vos informations.",
        instr_item_2: "<strong style='color:#dc2626;'>Règles strictes :</strong> La navigation privée est interdite. L'usage d'Intelligences Artificielles (ChatGPT, Gemini, Claude, etc.) est <strong>strictement interdit</strong>.",
        instr_item_3: "L'étude doit être réalisée <strong>d'une seule traite</strong> (en une seule session continue).",
        instr_item_4: "Votre réponse devrait idéalement faire <strong>entre 75 et 100 mots</strong> (un indicateur visuel vous guidera, mais vous pouvez valider votre texte même s'il est plus court).",
        instr_item_5: "La collecte de données se coupe automatiquement après <strong>1 heure d'inactivité</strong> ou après un maximum de <strong>4 heures d'activité</strong> (ne vous en faites pas, l'étude prend en réalité beaucoup moins de temps que cela !).",
        btn_commencer: "Commencer",

        // --- Questions de Recherche ---
        recherche_titre: "Question {index} / {total}",
        recherche_instructions: "Cherchez la réponse sur Internet puis rédigez-la ici (75 à 100 mots).",
        recherche_placeholder: "Rédigez votre réponse ici...",
        recherche_mots: "Mots : {count} / 75-100",
        btn_valider_reponse: "Valider ma réponse",
        alert_pas_de_recherche: "⚠️ Aucune recherche en ligne n'a été détectée pour cette question. Souhaitez-vous tout de même valider votre réponse sans faire de recherche ?",
        alert_temps_ecoule_recherche: "⏱️ Temps écoulé (12 minutes). Vous allez être redirigé vers l'auto-évaluation.",
        alert_10_min_warning: "⚠️ Cela fait 10 minutes que vous êtes sur cette question. Veuillez finaliser votre réponse et passer à la suite.",

        // --- Auto-évaluation & NASA-TLX ---
        eval_titre: "Évaluation",
        eval_concerne: "Concernant la question :",
        eval_err_radio: "Veuillez répondre à toutes les questions du tableau.",
        btn_valider_eval: "Valider l'évaluation",
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

        // --- Questionnaire Compétences Internet ---
        q_internet_titre: "Questionnaire de compétences Internet",
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
        ],

        // --- Introduction du Test de Mémoire ---
        mem_intro_titre: "Test de mémoire (Surprise !)",
        mem_intro_desc: "Vous allez maintenant répondre à <strong>{count} questions courtes</strong> portant sur les informations que vous avez consultées.",
        mem_intro_regle: "<strong>RÈGLE STRICTE :</strong> Vous devez répondre <strong>de mémoire</strong>. Vous n'avez pas le droit de chercher la réponse sur Internet.",
        mem_intro_limite: "Vous avez <strong>1 minute par question</strong> maximum.",
        btn_commencer_memoire: "Commencer le test",

        // --- Questions de Mémoire ---
        mem_titre: "Mémoire {index} / {total}",
        mem_placeholder: "Votre réponse de mémoire...",
        btn_valider_memoire: "Valider",
        alert_temps_ecoule_memoire: "⏱️ Temps écoulé (1 minute). Passage à la question suivante.",

        // --- Consentement du Débriefing (Duperie) ---
        debriefing_titre: "Formulaire d'information et de consentement post-expérimental",
        debriefing_choix_maintain: "Je souhaite <strong>maintenir</strong> ma participation à l'étude.",
        debriefing_choix_withdraw: "Je souhaite <strong>mettre fin</strong> à ma participation à l'étude. (Mes données seront détruites)",
        debriefing_err_retrait: "Nous comprenons votre décision. Vos données seront détruites.",
        debriefing_err_desinstaller: "Vous pouvez désinstaller l'extension Chrome.",
        btn_confirmer_choix: "Confirmer mon choix",
        debriefing_texte: `
            <p style="text-align:center; font-style:italic; color:#64748b; margin-bottom:20px;">Validation de questions de connaissances générales pour l'étude des processus de recherche d'information sur le Web</p>
            
            <h3>Debriefing</h3>
            <p>Au cours de l'expérience, vous avez eu à répondre à des questions à développement long à partir de recherches Web que vous avez effectuées. À la fin de l'expérience, vous avez eu à répondre à des questions de mémorisation en lien avec les sujets abordés. L'objectif de l'étude vous a donc été dissimulé.</p>
            <p>L'objectif caché de l'étude était en fait de voir si votre stratégie de recherche documentaire affecterait votre performance de mémorisation à ce test de mémoire surprise. La raison de cette dissimulation était que nous voulions nous assurer que vous n'utilisiez pas de stratégie de rétention particulière afin de pouvoir évaluer les effets de votre recherche web. Cette connaissance aurait pu modifier vos comportements et réactions face à la tâche.</p>

            <h3>Introduction</h3>
            <p>Suite à la divulgation de la duperie à laquelle vous avez été exposé(e), nous vous fournissons un addendum post-expérimental au Formulaire d'information et de consentement que vous avez signé avant le début de l'expérience. Ce document explique les éléments qui ont été dissimulés dans le formulaire original et réitère les informations liées à votre consentement. Vous êtes invité(e) à contacter l'équipe du laboratoire si vous avez des questions que vous jugez utiles.</p>
            
            <h3>Nature de l'étude</h3>
            <p>Initialement, nous avons indiqué que le but de cette recherche était de mieux comprendre comment les troupes d'individus interagissent avec les technologies de l'information à des fins de recherche d'information, plus spécifiquement les technologies web. Les véritables objectifs de l'étude sont de mieux comprendre comment les stratégies de recherche sur le web peuvent affecter la mémorisation du contenu rencontré dans un contexte de recherche d'information.</p>
            
            <h3>Participation volontaire et droit de retrait</h3>
            <p>Vous êtes libre de maintenir ou de retirer votre consentement suite à la divulgation de cette information. Vous pouvez mettre fin à votre participation sans préjudice, conserver votre compensation, et sans avoir à justifier votre décision. Toutes les informations personnelles vous concernant ainsi que vos réponses seront alors détruites. Veuillez sélectionner l'option qui reflète le mieux votre décision suite à la divulgation de cette duperie.</p>
            
            <h3>Renseignements supplémentaires et plaintes</h3>
            <p>Pour toute question, veuillez contacter le laboratoire à <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. Les plaintes peuvent être adressées au Bureau de l'Ombudsman de l'Université Laval : Pavillon Alphonse-Desjardins, bureau 3320, 2325, rue de l'Université, Québec (Québec) G1V 0A6. Ligne sans frais : 1 866 323-2271. Courriel : <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a></p>
            
            <p style="font-size:0.8em; color:#64748b; margin-top:20px; line-height:1.5;">Ce projet de recherche intitulé « La métacognition et l'effort mental influencent-ils l'expérience d'interaction avec un agent conversationnel ? », mené par Alexandre Marois, professeur à l’École de psychologie de l’Université Laval, est financé par le Conseil de recherches en sciences naturelles et en génie du Canada (CRSNG). Ce projet a été approuvé par le Comité d’éthique de la recherche de l’Université Laval : No d’approbation 2025-460 / 23-10-2025.</p>
        `,

        // --- Fin de l'étude ---
        fin_titre: "Merci pour votre participation !",
        fin_soustitre: "Vos réponses ont été enregistrées avec succès.",
        fin_texte: `
            <div style="margin-top:32px; padding:24px; background:#fef2f2; border:1px solid #fecaca; border-radius:12px; text-align:left;">
                <h3 style="margin:0 0 16px; font-size:18px; color:#dc2626;">Dernière étape cruciale : Désinstaller l'extension</h3>
                <p style="font-size:14px; color:#475569; margin-bottom:12px;">L'étude est maintenant terminée. Vous devez retirer l'extension de votre navigateur.</p>
                
                <p style="font-size:13px; color:#b91c1c; font-weight:600; margin-bottom:20px; background:#fee2e2; padding:12px; border-radius:6px; border:1px dashed #fca5a5; line-height:1.5;">
                    Si vous rencontrez des problèmes pour désinstaller l'extension, contactez l'équipe à l'adresse courriel suivante : <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. Mais ne vous en faites pas, même si elle reste installée, l'extension ne collectera plus aucune donnée.
                </p>

                <div style="display:flex; flex-direction:column; gap:20px; margin-bottom:20px;">
                    <!-- ÉTAPE 1 -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
                        <p style="margin:0 0 10px 0; font-size:15px; color:#334155;">
                            <strong style="color:#3b82f6;">Étape 1 :</strong> Cliquez droit sur l'icône de l'extension.
                        </p>
                        <img src="/images/uninstall_1.png" alt="Étape 1" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    </div>

                    <!-- ÉTAPE 2 -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
                        <p style="margin:0 0 10px 0; font-size:15px; color:#334155;">
                            <strong style="color:#3b82f6;">Étape 2 :</strong> Cliquez sur "Supprimer de Chrome".
                        </p>
                        <img src="/images/uninstall_2.png" alt="Étape 2" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    </div>

                    <!-- ÉTAPE 3 -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
                        <p style="margin:0 0 10px 0; font-size:15px; color:#334155;">
                            <strong style="color:#3b82f6;">Étape 3 :</strong> Une petite fenêtre s'ouvrira en haut de l'écran. Cliquez sur le bouton "Supprimer" pour confirmer.
                        </p>
                        <img src="/images/uninstall_3.png" alt="Étape 3" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    </div>
                </div>
            </div>
        `,

        // --- Sécurité et Limite de temps ---
        limite_inactivite: "La collecte de données s'est arrêtée suite à 1 heure d'inactivité.",
        limite_max_temps: "La collecte de données s'est arrêtée car le délai maximum autorisé de 4 heures est écoulé.",
        limite_donnees_invalides: "Vos données sont invalidées.",
        limite_etude_annulee: "Étude annulée"
    },

    en: {
        // --- Language Phase ---
        langue_titre: "Preferred Language / Langue préférentielle",
        langue_select_default: "-- Select / Sélectionnez --",
        btn_continuer: "Continue / Continuer",

        // --- Consent ---
        consentement_titre: "Consent Form",
        consentement_intro: "Please read the following information carefully before participating in the study.",
        consentement_checkbox: "I have read and understood the information above and wish to participate in the study. I confirm that I am 18 years of age or older.",
        btn_consentement_accepter: "I accept and wish to participate",
        btn_consentement_refuser: "I do not wish to participate",
        consentement_refuse_titre: "Thank You",
        consentement_refuse_texte: "We understand your decision. You may close this page.",
        consentement_texte: `
            <h3>Researcher Presentation</h3>
            <p>This research is conducted as part of a grant from the Natural Sciences and Engineering Research Council of Canada, led by Alexandre Marois, Assistant Professor at the School of Psychology of Université Laval and Director of the Laboratory for Interdisciplinary Studies on Human Limits and Augmentation (LEILAH).</p>
            
            <h3>Introduction</h3>
            <p>Before agreeing to participate in this study, please take the time to read and understand the following information. This document explains the purpose of this research, its procedures, benefits, and disadvantages. If you have any questions about the research or the implications of your participation, please contact the laboratory by email at <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>
            
            <h3>Nature of the Study</h3>
            <p>The research aims to better understand how individuals interact with information technologies for literature searches, specifically web technologies.</p>
            
            <h3>Procedure of Participation</h3>
            <p>Once you have read this consent form, you will be asked to fill out a form specifying some of your sociodemographic characteristics. We will then ask you to perform a literature search task. To do this, we will invite you to answer long-answer questions on various general knowledge topics.</p>
            <p>To support you in your task, you are encouraged to use classic search engines (e.g., Google). We ask you <strong>not to use any artificial intelligence tools</strong> (e.g., Gemini, ChatGPT, or Copilot) to perform the task. Your navigation will be recorded throughout the study and, consequently, the research team will have to invalidate your data if you use these tools.</p>
            <p>After each of the long-answer questions, a few questions will be asked about the processes you used during your information search. At the end, you will also be asked to fill out two other questionnaires regarding your experience.</p>
            <p>Your questionnaires will only be considered complete if you consent to participate in the research by selecting the corresponding option.</p>
            
            <h3>Benefits and Disadvantages</h3>
            <p>An advantage of this study is that you will contribute to the advancement of knowledge related to the use of information technologies to support human performance. This project will highlight the processes involved in information retrieval. The study will also validate and produce response standards for the various questions you will answer.</p>
            <p>A disadvantage of this project is the induction of some cognitive fatigue. You will indeed have to perform moderate mental effort for about 60 minutes. The time dedicated to the project may also represent a disadvantage. You will have the opportunity to take a break at any time if the fatigue you feel becomes too difficult, but you must still complete the study in a single session.</p>
            
            <h3>Voluntary Participation and Right of Withdrawal</h3>
            <p>You are free to participate or not in this study. Simply returning the completed questionnaire will be considered as an implicit expression of your consent to participate in the project. If you wish to withdraw from the study once the questionnaire is submitted, please contact the laboratory by email at <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. We can remove your results without prejudice, keeping your compensation, and without you having to justify your decision.</p>
            
            <h3>Confidentiality and Data Management</h3>
            <p>The data collected during this study are completely confidential and cannot, under any circumstances, lead to your identification. Your confidentiality will be ensured by assigning a numeric code, which does not appear on this form, to all collected research data. The data will only be accessible to members of the research team, each of whom has signed a confidentiality agreement.</p>
            <p>The data will be kept by the research team for future use in an irreversibly coded form in an anonymous database, following the destruction of research material (list of participant names and any documents allowing their identification), until <strong>December 2035</strong> at the latest. The results of the research, which may be disseminated in the form of scientific articles, research reports, presentations at scientific conferences, and/or doctoral theses, will not identify participants.</p>
            
            <h3>Additional Information and Complaints</h3>
            <p>If you have any questions, contact <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. Any complaints about this study may be addressed to the Office of the Ombudsman of Université Laval: Pavillon Alphonse-Desjardins, office 3320, 2325 rue de l'Université, Québec G1V 0A6. Toll-free line: 1 866 323-2271. Email: <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a></p>
        `,

        // --- Demographics ---
        demo_titre: "Personal Information",
        demo_description: "Your email address is only required to contact you regarding your financial compensation method, as well as to allow us to find and delete your data if you decide to withdraw your consent later. It will be kept securely and completely separate from your navigation data.",
        demo_email: "Email Address",
        demo_age: "Age",
        demo_maitrise_langue: "Level of proficiency in the study language",
        demo_select_default: "-- Select --",
        demo_lang_debutant: "Beginner",
        demo_lang_intermediaire: "Intermediate",
        demo_lang_expert: "Expert",
        demo_lang_natif: "Native / Mother Tongue",
        demo_scolarite: "Education Level",
        demo_scol_secondaire: "High School",
        demo_scol_cegep: "College / DEC",
        demo_scol_bac: "Bachelor's Degree",
        demo_scol_maitrise: "Master's Degree",
        demo_scol_doctorat: "Ph.D.",
        demo_scol_autre: "Other",
        demo_compensation: "How would you like to receive your compensation?",
        demo_pay_interac: "Interac e-Transfer (email above)",
        demo_pay_pickup: "Pick up at Université Laval",
        demo_pay_cheque: "Cheque by mail",
        demo_err_champs: "Please fill out all fields.",
        btn_suivant: "Next",

        // --- Instructions ---
        instr_titre: "Instructions",
        instr_texte: "You will answer <strong>{count} research questions</strong>.",
        instr_item_1: "<strong>Browse freely</strong> in other tabs (Google, Wikipedia, etc.) to find your information.",
        instr_item_2: "<strong style='color:#dc2626;'>Strict Rules:</strong> Private browsing is prohibited. The use of Artificial Intelligence tools (ChatGPT, Gemini, Claude, etc.) is <strong>strictly prohibited</strong>.",
        instr_item_3: "The study must be completed <strong>in one single run</strong> (in one continuous session).",
        instr_item_4: "Your answer should ideally be <strong>between 75 and 100 words</strong> (a visual indicator will guide you, but you can submit your text even if it is shorter).",
        instr_item_5: "Data collection stops automatically after <strong>1 hour of inactivity</strong> or after a maximum of <strong>4 hours of activity</strong> (don't worry, the study actually takes much less time than that!).",
        btn_commencer: "Start",

        // --- Research Questions ---
        recherche_titre: "Question {index} / {total}",
        recherche_instructions: "Search for the answer on the Internet and then write it here (75 to 100 words).",
        recherche_placeholder: "Write your answer here...",
        recherche_mots: "Words: {count} / 75-100",
        btn_valider_reponse: "Submit my answer",
        alert_pas_de_recherche: "⚠️ No online search was detected for this question. Do you still want to validate your answer without searching?",
        alert_temps_ecoule_recherche: "⏱️ Time's up (12 minutes). You will be redirected to the self-assessment.",
        alert_10_min_warning: "⚠️ You have been on this question for 10 minutes. Please finalize your response and proceed to the next step.",

        // --- Self-Assessment & NASA-TLX ---
        eval_titre: "Evaluation",
        eval_concerne: "Concerning the question:",
        eval_err_radio: "Please answer all questions in the table.",
        btn_valider_eval: "Submit evaluation",
        q_connaissance_titre: "Initial Knowledge Level",
        q_connaissance_item: "On a scale of 0 to 100, I estimate my initial knowledge regarding the topic of the question at the following level:",
        q_confiance_titre: "Confidence in Answer and Sources",
        q_confiance_legende: "Please indicate your level of agreement with the following statements (1 = Strongly disagree, 5 = Strongly agree):",
        q_confiance_items: [
            "I am confident in the answer I provided for the question.",
            "I used information from digital sources to answer the question.",
            "I trust the digital source I used to answer the question."
        ],
        q_nasa_titre: "Task Assessment",
        q_nasa_legende: "Please assess your experience on a scale from 1 (low) to 100 (high):",
        q_nasa_items: [
            { id: "tlx_mental", titre: "MENTAL DEMAND", desc: "How much mental and perceptual activity was required (e.g., thinking, deciding, calculating, remembering, looking, searching, etc.)?" },
            { id: "tlx_phys", titre: "PHYSICAL DEMAND", desc: "How much physical activity was required (e.g., pushing, pulling, turning, controlling, activating, etc.)?" },
            { id: "tlx_temp", titre: "TEMPORAL DEMAND", desc: "How much time pressure did you feel due to the rate or pace at which the tasks or task elements occurred?" },
            { id: "tlx_effort", titre: "EFFORT", desc: "How hard did you have to work (mentally and physically) to accomplish your level of performance?" },
            { id: "tlx_perf", titre: "PERFORMANCE", desc: "How successful do you think you were in accomplishing the goals of the task set by the experimenter (or yourself)?" },
            { id: "tlx_frust", titre: "FRUSTRATION", desc: "How insecure, discouraged, irritated, stressed, or annoyed did you feel during the task?" }
        ],

        // --- Internet Skills Questionnaire ---
        q_internet_titre: "Internet Skills Questionnaire",
        q_internet_legende: "Please indicate how much these statements apply to you (1 = Not at all like me, 5 = Highly like me):",
        q_internet_items: [
            "I know how to download files.",
            "I know how to download/save photos found online.",
            "I know how to use keyboard shortcuts (e.g., CTRL-C to copy, CTRL-S to save).",
            "I know how to open a new tab on my web browser.",
            "I know how to bookmark a website.",
            "I know where to click to go to a different webpage.",
            "I have difficulty finding the best keywords for online searches.",
            "I have difficulty finding a website I have already visited.",
            "I get tired quickly when searching for information online.",
            "Sometimes, I find myself browsing a website without really knowing how I got there.",
            "I am sometimes confused by the way websites are designed.",
            "I should take a class on how to search for information on the Internet.",
            "Sometimes, I find it difficult to verify information found online.",
            "I know what information I should share and what I should not share online.",
            "I know when to share and when not to share information online.",
            "I make sure my comments and behaviors online are appropriate for the situation.",
            "I know how to change who I share information with online (e.g., friends, friends of friends, public).",
            "I know how to remove people from my friends lists.",
            "I know how to create new content from images, music, or videos found on the web.",
            "I know how to make minor changes to content produced by others.",
            "I know how to design a website.",
            "I am comfortable with the different types of licenses that apply to online content.",
            "I would feel confident posting a video I created online.",
            "I know how to install an app on a mobile device.",
            "I know how to download an app on my mobile device.",
            "I know how to track the usage costs of mobile apps."
        ],

        // --- Memory Test Intro ---
        mem_intro_titre: "Memory Test (Surprise!)",
        mem_intro_desc: "You will now answer <strong>{count} short-answer questions</strong> about the information you have just browsed.",
        mem_intro_regle: "<strong>STRICT RULE:</strong> You must answer <strong>from memory</strong>. You are not allowed to search for the answer on the Internet.",
        mem_intro_limite: "You have a maximum of <strong>1 minute per question</strong>.",
        btn_commencer_memoire: "Start test",

        // --- Memory Questions ---
        mem_titre: "Memory {index} / {total}",
        mem_placeholder: "Your answer from memory...",
        btn_valider_memoire: "Submit",
        alert_temps_ecoule_memoire: "⏱️ Time's up (1 minute). Moving to the next question.",

        // --- Debriefing Consent (Deception) ---
        debriefing_titre: "Post-Experimental Information and Consent Form",
        debriefing_choix_maintain: "I wish to <strong>maintain</strong> my participation in the study.",
        debriefing_choix_withdraw: "I wish to <strong>withdraw</strong> my participation from the study. (My data will be destroyed)",
        debriefing_err_retrait: "We understand your decision. Your data will be destroyed.",
        debriefing_err_desinstaller: "You may now uninstall the Chrome extension.",
        btn_confirmer_choix: "Confirm my choice",
        debriefing_texte: `
            <p style="text-align:center; font-style:italic; color:#64748b; margin-bottom:20px;">Validation of general knowledge questions for the study of web information search processes</p>
            
            <h3>Debriefing</h3>
            <p>During the experiment, you had to answer long-answer questions based on Web searches you performed. At the end of the experience, you had to answer memory questions related to the topics covered. The true purpose of the study was therefore hidden from you.</p>
            <p>The hidden objective of the study was actually to see if your document search strategy would affect your memory performance in this surprise memory test. The reason for this deception was to ensure that you did not use any particular memory retention strategies so that we could evaluate the natural effects of your web search. This knowledge could have altered your behaviors and reactions to the task.</p>

            <h3>Introduction</h3>
            <p>Following the disclosure of the deception to which you were exposed, we provide you with a post-experimental addendum to the Information and Consent Form you signed before the start of the experience. This document explains the elements that were hidden in the original form and reiterates the information related to your consent. You are invited to contact the laboratory team if you have any questions you find useful.</p>
            
            <h3>Nature of the Study</h3>
            <p>Initially, we indicated that the purpose of this research was to better understand how individuals interact with information technologies for information retrieval, specifically web technologies. The true objectives of the study are to better understand how web search strategies can affect memory retention of content encountered in an information retrieval context.</p>
            
            <h3>Voluntary Participation and Right of Withdrawal</h3>
            <p>You are free to maintain or withdraw your consent following the disclosure of this information. You can end your participation without prejudice, keep your compensation, and without having to justify your decision. All personal information about you as well as your answers will then be destroyed. Please select the option that best reflects your decision following the disclosure of this deception.</p>
            
            <h3>Additional Information and Complaints</h3>
            <p>For any questions, please contact the laboratory at <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. Complaints can be addressed to the Office of the Ombudsman of Université Laval: Pavillon Alphonse-Desjardins, office 3320, 2325, rue de l'Université, Québec (Québec) G1V 0A6. Toll-free line: 1 866 323-2271. Email: <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a></p>
            
            <p style="font-size:0.8em; color:#64748b; margin-top:20px; line-height:1.5;">This research project entitled "Does metacognition and mental effort influence the interaction experience with a conversational agent?", conducted by Alexandre Marois, professor at the School of Psychology of Université Laval, is funded by the Natural Sciences and Engineering Research Council of Canada (NSERC). This project has been approved by the Research Ethics Committee of Université Laval: Approval No. 2025-460 / 23-10-2025.</p>
        `,

        // --- End Screen ---
        fin_titre: "Thank you for your participation!",
        fin_soustitre: "Your answers have been successfully recorded.",
        fin_texte: `
            <div style="margin-top:32px; padding:24px; background:#fef2f2; border:1px solid #fecaca; border-radius:12px; text-align:left;">
                <h3 style="margin:0 0 16px; font-size:18px; color:#dc2626;">Last crucial step: Uninstall the extension</h3>
                <p style="font-size:14px; color:#475569; margin-bottom:12px;">The study is now complete. You must remove the extension from your browser.</p>
                
                <p style="font-size:13px; color:#b91c1c; font-weight:600; margin-bottom:20px; background:#fee2e2; padding:12px; border-radius:6px; border:1px dashed #fca5a5; line-height:1.5;">
                    If you encounter any problems uninstalling the extension, contact the team at the following email address: <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. But do not worry, even if it remains installed, the extension will no longer collect any data.
                </p>

                <div style="display:flex; flex-direction:column; gap:20px; margin-bottom:20px;">
                    <!-- STEP 1 -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
                        <p style="margin:0 0 10px 0; font-size:15px; color:#334155;">
                            <strong style="color:#3b82f6;">Step 1:</strong> Right-click on the extension icon.
                        </p>
                        <img src="/images/uninstall_1.png" alt="Step 1" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    </div>

                    <!-- STEP 2 -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
                        <p style="margin:0 0 10px 0; font-size:15px; color:#334155;">
                            <strong style="color:#3b82f6;">Step 2:</strong> Click on "Remove from Chrome".
                        </p>
                        <img src="/images/uninstall_2.png" alt="Step 2" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    </div>

                    <!-- STEP 3 -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
                        <p style="margin:0 0 10px 0; font-size:15px; color:#334155;">
                            <strong style="color:#3b82f6;">Step 3:</strong> A small window will appear at the top of the screen. Click on the "Remove" button to confirm.
                        </p>
                        <img src="/images/uninstall_3.png" alt="Step 3" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    </div>
                </div>
            </div>
        `,

        // --- Security and Time limits ---
        limite_inactivite: "Data collection stopped due to 1 hour of inactivity.",
        limite_max_temps: "Data collection stopped because the maximum allowed duration of 4 hours has elapsed.",
        limite_donnees_invalides: "Your data has been invalidated.",
        limite_etude_annulee: "Study Cancelled"
    }
};