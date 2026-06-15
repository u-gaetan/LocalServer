const i18n = {
    fr: {
        // --- Phase de Langue ---
        langue_titre: "Langue préférentielle / Preferred Language",
        langue_select_default: "-- Sélectionnez / Select --",
        btn_continuer: "Continuer / Continue",

        tuto_titre: "Installation de l'extension",
        tuto_description: "Pour réaliser cette recherche, vous devez installer notre extension Chrome temporaire. Celle-ci transmettra vos données d'analyse uniquement durant les étapes requises de l'étude.",
        tuto_statut_attente: "En attente de l'installation de l'extension...",
        tuto_statut_detecte: "Extension détectée avec succès !",
        tuto_statut_detecte_detail: "Veuillez maintenant cliquer sur l'icône de l'extension dans la barre d'outils de votre navigateur, puis cliquez sur 'DÉMARRER L'ÉTUDE'.",
        tuto_etape1_titre: "Télécharger l'extension",
        tuto_etape1_texte: "Cliquez sur le bouton ci-dessous pour accéder au téléchargement de l'extension Chrome d'étude de navigation.",
        tuto_bouton_telecharger: "Ajouter à Chrome (Placeholder)",
        tuto_etape2_titre: "Ouvrir la liste des extensions",
        tuto_etape2_texte: "Cliquez sur l'icône de pièce de puzzle en haut à droite.",
        tuto_etape3_titre: "Ouvrir l'extension",
        tuto_etape3_texte: "Cliquez sur l'icône de l'extension de l'Université Laval.",
        tuto_etape4_titre: "Démarrer l'étude",
        tuto_etape4_texte: "Appuyez sur le bouton bleu pour initier la collecte de données et continuer l'étude.",
        tuto_statut_attente: "En attente de l'installation de l'extension... (Si vous venez de l'installer, rafraîchissez cette page)",
        // --- Consentement ---
        consentement_titre: "Formulaire d'information et de consentement",
        consentement_sous_titre: "Validation de questions de connaissances générales pour l'étude des processus de recherche d'information Web",
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
            <p>Une fois cette fiche de consentement implicite lue, vous serez amené à remplir une fiche sur laquelle vous devez préciser quelques-unes de vos caractéristiques sociodémographiques. Nous vous demanderons ensuite d’effectuer une tâche de recherche documentaire. Pour ce faire, nous vous inviterons à installer puis activer une extension qui nous permettra de prélever des informations sur votre navigation Web. À noter que cette extension, développée par l’équipe de recherche, permet de prélever les informations de navigation que lorsqu’elle est activée. Tout au long de l’étude, nous vous guiderons sur son installation, son activation, puis sa désactivation et sa désinstallation définitive de votre ordinateur. Il est à noter que cette extension, essentielle à la réalisation de l’étude, permettra de prélever les informations suivantes : sites Web visités, temps passé et contenu de chaque site visité, manipulations effectuées sur les sites (p. ex., navigation dans la page), activités claviers (i.e. compteur de touches, contenu copié-collé). Puisque la présente étude vise à évaluer les processus de navigation Web pour la recherche documentaire, ces informations sont essentielles. Nous vous encourageons donc à vous concentrer sur la tâche et à seulement réaliser l’expérience, en évitant de naviguer sur des pages Web tierces. Toute page Web ouverte avant l’activation de l’extension ne sera pas enregistrée, mais nous vous encourageons tout de même à les fermer. Notez également que l’extension ne peut que fonctionner sur Google Chrome et ne fonctionne pas en mode Navigation privée. Veuillez donc simplement faire vos recherche Web sur une page habituelle du navigateur Google Chrome.</p>
            <p>Une fois l’extension activée, nous vous présenterons une interface qui contiendra 5 questions à développement long sur différents sujets de culture générale. Afin de vous soutenir dans votre tâche, vous serez encouragé à utiliser des moteurs de recherche classique (p. ex. Google) ou tout autre site que vous trouvez pertinent, à nouveau, à partir du navigateur Google Chrome. Nous vous demandons de ne pas utiliser d’outil d’intelligence artificielle (p. ex. Gemini, ChatGPT ou Copilot) pour réaliser la tâche. L’extension permet d’ailleurs de bloquer l’outil automatique d’intelligence artificielle Gemini, parfois présenté par défaut sur le navigateur Chrome. Pour rappel, vos informations de navigation Web seront enregistrées tout au long de l’étude et, conséquemment, l’équipe de recherche devra invalider vos données si vous utilisez ces outils. Vous aurez un maximum de 10 minutes pour répondre à chacune des questions du mieux que vous pouvez. Après chacune des questions à développement long, quelques questions vous seront posées quant aux processus que vous avez mis en branle lors de la recherche d’information que vous avez effectuée. À la fin, vous aurez également à remplir deux autres questionnaires par rapport à votre expérience. Vos questionnaires ne seront considérés comme complets que si vous consentez à participer à la recherche en sélectionnant l’option correspondante.</p>

            <h3>Avantages et inconvénients</h3>
            <p>Un avantage à cette étude est que vous contribuerez aux avancements des connaissances liées à l’usage des technologies de l’information afin de soutenir la performance humaine. Ce projet permettra de mettre en lumière les processus mis en branle lors de la recherche documentaire. L’étude permettra aussi de valider et de produire des normes de réponse pour les différentes questions auxquelles vous répondrez.</p>
            <p>Un inconvénient à ce projet est l’induction d’une certaine fatigue cognitive. Vous aurez en effet à effectuer un effort mental modéré pendant environ 60 min. Le temps consacré au projet peut également représenter un inconvénient. Vous aurez la possibilité de prendre une pause à tout moment si la fatigue que vous ressentez devient trop difficile mais vous devrez tout de même terminer l’étude en une seule période.</p>
            
            <h3>Compensation </h3>
            <p>Une compensation financière est fournie afin de couvrir le temps requis pour réaliser l’étude. Une compensation de 30 $ sera fournie pour votre participation. À noter toutefois que cette compensation n’est fournie que si vous réalisez l’étude dans son ensemble et que vos données demeurent valides, c’est-à-dire exemptes de soutien de l’intelligence artificielle. Les informations afin d’obtenir la compensation monétaire vous seront fournies en fin d’expérience. Ce transfert d’argent sera effectué via virement Interac, retrait à l'université Laval ou par la poste en fonction de ce que vous choisirez.</p>

            <h3>Participation volontaire et droit de retrait</h3>
            <p>Vous êtes libre de participer ou non à cette étude. Le simple retour du questionnaire rempli sera considéré comme l’expression implicite de votre consentement à participer au projet. Si vous désirez vous retirer de l’étude une fois le questionnaire soumis, veuillez communiquer avec le laboratoire par courriel au LEILAH@ulaval.ca. Nous pourrons retirer vos résultats sans préjudice, en gardant votre compensation et sans avoir à justifier votre décision.</p>
            
            <h3>Confidentialité et gestion des données</h3>
            <p>Les données recueillies pendant cette étude sont entièrement confidentielles et ne pourront en aucun cas mener à votre identification une fois la table de correspondance détruite en décembre 2027. Votre confidentialité sera assurée par l’attribution d’un code numérique qui ne figure pas au présent formulaire à toutes les données de recherche collectées. Les données de navigation seront anonymisées et désassociées de votre identification. Vos coordonnées ne seront accessibles qu’aux membres de l’équipe de recherche, chacun d’eux ayant signé un engagement à la confidentialité. Si des données sensibles ont été collectées (p. ex. identifiant sur des sites de recherche d’information, URLs), notez que celles-ci seront détruites de façon non réversible en décembre 2028. Les seules personnes ayant accès à ces données auront signé une entente de confidentialité et ces informations ne seront pas associées à votre identité.</p>
            <p>Les données anonymisées et agrégées seront conservées par l’équipe de recherche pour utilisation ultérieure sous forme codée de manière irréversible dans une base de données anonyme, c’est-à-dire à la suite de la destruction du matériel de recherche (liste de nom des personnes participantes et tout document permettant de les identifier), jusqu’au plus tard en décembre 2035. Les résultats de la recherche, qui pourront être diffusés sous forme d’article scientifique, de rapport de recherche, de présentation à un congrès scientifique et/ou d’une thèse doctorale, ne permettront pas d’identifier les personnes participantes.</p>
            
            <h3>Plaintes ou critiques</h3>
            <p>
                Toute plainte ou critique sur cette étude pourra être adressée au Bureau de l'Ombudsman de l'Université Laval :
            </p>

            <p>
                Pavillon Alphonse-Desjardins, bureau 3320<br>
                2325, rue de l’Université<br>
                Université Laval<br>
                Québec (Québec) G1V 0A6<br>
                Renseignements - Secrétariat : 1 418 656-3081<br>
                Ligne sans frais : 1 866 323-2271<br>
                Courriel :
                <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a>
            </p>

            <p style="font-size:0.8em; color:#64748b; margin-top:20px; line-height:1.5;">
                Ce projet de recherche intitulé « Validation de questions de connaissances générales pour l'étude des processus de recherche
                d'information Web », mené par Alexandre Marois, professeur à l’École de psychologie de l’Université Laval, est financé par le Conseil de
                recherches en sciences naturelles et en génie du Canada (CRSNG). Ce projet a été approuvé par le Comité d’éthique de la recherche de
                l’Université Laval : No d’approbation 2025-460 A-1 / 04-05-2026.
            </p>
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
        demo_compensation: "Comment souhaitez-vous recevoir votre compensation ? (nous vous contacterons après l'étude pour les détails)",
        demo_pay_interac: "Virement Interac",
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
        instr_item_4: "Vous avez 10 min pour répondre à chaque question. Votre réponse devrait idéalement faire <strong>entre 75 et 100 mots</strong> (un indicateur visuel vous guidera, mais vous pouvez valider votre texte même s'il est plus court ou plus long).",
        instr_item_5: "La collecte de données se coupe automatiquement après <strong>1 heure d'inactivité</strong> ou après un maximum de <strong>4 heures d'activité</strong> (c'est une sécurité, l'étude prend en réalité beaucoup moins de temps que cela !).",
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
        debriefing_sous_titre: "Validation de questions de connaissances générales pour l'étude des processus de recherche d'information sur le Web",
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
            <p>Suivant le dévoilement de la duperie à laquelle nous vous avons exposée, nous vous présentons un addendum postexpérimental pour le Formulaire d’information et de consentement que vous avez signé avant le début de l’expérience. Ce document vous explique les éléments qui vous ont été cachés dans le formulaire initial et redonne des informations en lien avec votre consentement. Nous vous invitons à écrire à l’équipe du laboratoire pour poser toutes les questions que vous jugerez utiles.</p>
            
            <h3>Nature de l'étude</h3>
            <p>Initialement, nous avions indiqué que l’objectif de cette recherche était de mieux comprendre la façon dont les individus interagissent avec des technologies de l’information pour la recherche documentaire, plus spécifiquement des technologies web. Les objectifs réels de l’étude sont de mieux comprendre la façon dont les stratégies de recherche Web peuvent affecter la mémorisation de contenu abordé dans un contexte de recherche documentaire.</p>
            
            <h3>Participation volontaire et droit de retrait</h3>
            <p>Vous êtes libre de maintenir ou non votre consentement suivant la divulgation de ces informations. Vous pouvez mettre fin à votre participation sans préjudice, en gardant votre compensation et sans avoir à justifier votre décision. Tous les renseignements personnels vous concernant et vos réponses seront alors détruits. Veuillez svp choisir l’option qui vous convient suivant la divulgation de cette duperie.</p>
            
            <h3>Renseignements supplémentaires</h3>
            <p>Si vous avez des questions sur la recherche ou sur les implications de votre participation, veuillez communiquer avec le laboratoire par courriel au <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>
            <h3>Plaintes ou critiques</h3>
            <p>Toute plainte ou critique sur cette étude pourra être adressée au Bureau de l'Ombudsman de l'Université Laval :</p>
            <p>Pavillon Alphonse-Desjardins, bureau 3320 <br>
                2325, rue de l’Université <br>
                Université Laval <br>
                Québec (Québec) G1V 0A6 <br>
                Renseignements - Secrétariat : 1 418 656-3081 <br>
                Ligne sans frais : 1 866 323-2271 <br>
                Courriel : info@ombudsman.ulaval.ca 
            </p>
            <p style="font-size:0.8em; color:#64748b; margin-top:20px; line-height:1.5;">Ce projet de recherche intitulé « Validation de questions de connaissances générales pour l'étude des processus de recherche
            d'information Web », mené par Alexandre Marois, professeur à l’École de psychologie de l’Université Laval, est financé par le Conseil de
            recherches en sciences naturelles et en génie du Canada (CRSNG). Ce projet a été approuvé par le Comité d’éthique de la recherche de
            l’Université Laval : No d’approbation No d’approbation 2025-460 A-1 / 04-05-2026.</p>
        `,

        // --- Fin de l'étude ---
        fin_titre: "Merci pour votre participation !",
        fin_soustitre: "Vos réponses ont été enregistrées avec succès.",
        fin_texte: `
            <div style="margin-top:32px; padding:24px; background:#fef2f2; border:1px solid #fecaca; border-radius:12px; text-align:left;">
                <h3 style="margin:0 0 16px; font-size:18px; color:#dc2626;">Dernière étape cruciale : Désinstaller l'extension</h3>
                <p style="font-size:14px; color:#475569; margin-bottom:12px;">L'étude est maintenant terminée. Vous devez retirer l'extension de votre fureteur pour compléter le processus.</p>
                
                <p style="font-size:13px; color:#b91c1c; font-weight:600; margin-bottom:24px; background:#fee2e2; padding:12px; border-radius:6px; border:1px dashed #fca5a5; line-height:1.5;">
                    Si vous rencontrez des problèmes pour désinstaller l'extension, contactez l'équipe à l'adresse courriel suivante : <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. Mais ne vous en faites pas, même si elle restait installée, l'extension ne collectera plus aucune donnée.
                </p>

                <!-- MÉTHODE 1 (PRINCIPALE ET RAPIDE) -->
                <div style="background:#fff; border:1px solid #cbd5e1; border-left:4px solid #ef4444; border-radius:8px; padding:16px; margin-bottom:20px;">
                    <h4 style="margin:0 0 12px 0; font-size:16px; color:#1e293b;">
                        ⚡ Méthode 1 : Désinstallation instantanée (Recommandée)
                    </h4>
                    <p style="margin:0 0 14px 0; font-size:14px; color:#475569; line-height:1.5;">
                        <strong>Étape 1 :</strong> Cliquez sur le bouton rouge ci-dessous pour déclencher la désinstallation :
                        <br>
                        <button id="btnUninstallFromPage" style="margin-top:10px; padding:12px 24px; font-weight:bold; background-color:#ef4444; color:white; border:none; border-radius:6px; cursor:pointer; display:inline-block; font-family:inherit; font-size:14px;">🗑️ Désinstaller l'extension</button>
                    </p>
                    
                    <div style="border-top:1px solid #f1f5f9; padding-top:12px;">
                            <p style="margin:14px 0 10px 0; font-size:14px; color:#475569; line-height:1.5;">
                            <strong>Étape 2 :</strong> Confirmez la suppression dans la boîte de dialogue native qui apparaît en haut de votre écran en cliquant sur <strong>"Supprimer"</strong>.
                            </p>
                            <img src="/images/fr_uninstall_4.png" alt="Étape 2" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    </div>
                </div>

                <!-- MÉTHODE 2 (ALTERNATIVE ET MANUELLE) -->
                <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:16px; margin-bottom:10px;">
                    <h4 style="margin:0 0 12px 0; font-size:15px; color:#475569;">
                        🧩 Méthode 2 : Désinstallation manuelle (Alternative)
                    </h4>
                    <p style="font-size:13px; color:#64748b; margin-top:-8px; margin-bottom:16px;">
                        <em>Utilisez cette méthode uniquement si le bouton rouge ci-dessus ne répond pas.</em>
                    </p>

                    <div style="display:flex; flex-direction:column; gap:16px;">
                        <div style="border-top:1px solid #f1f5f9; padding-top:12px;">
                            <p style="margin:0 0 8px 0; font-size:13px; color:#334155;"><strong>Étape A :</strong> Cliquez sur l'icône de pièce de puzzle (menu Extensions) en haut à droite.</p>
                            <img src="/images/fr_uninstall_1.png" alt="Étape A" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        </div>
                        <div style="border-top:1px solid #f1f5f9; padding-top:12px;">
                            <p style="margin:0 0 8px 0; font-size:13px; color:#334155;"><strong>Étape B :</strong> Cliquez sur le bouton avec les 3 points à côté de l'extension de l'étude.</p>
                            <img src="/images/fr_uninstall_2.png" alt="Étape B" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        </div>
                        <div style="border-top:1px solid #f1f5f9; padding-top:12px;">
                            <p style="margin:0 0 8px 0; font-size:13px; color:#334155;"><strong>Étape C :</strong> Cliquez sur le bouton "Supprimer de Chrome".</p>
                            <img src="/images/fr_uninstall_3.png" alt="Étape C" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        </div>
                        <div style="border-top:1px solid #f1f5f9; padding-top:12px;">
                            <p style="margin:0 0 8px 0; font-size:13px; color:#334155;"><strong>Étape D :</strong> Une petite fenêtre s'ouvrira en haut de l'écran. Cliquez sur le bouton "Supprimer" pour confirmer.</p>
                            <img src="/images/fr_uninstall_4.png" alt="Étape D" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        </div>
                    </div>
                </div>
            </div>
        `,
        termination_titre: "Fin de l'étude",
        termination_raison_consent_refuse: "Vous avez choisi de ne pas accepter le formulaire de consentement initial.",
        termination_raison_deception_refuse: "Vous avez choisi de retirer votre participation suite aux explications du débriefing.",
        termination_raison_inactivite: "La collecte a pris fin en raison d'une inactivité prolongée (1 heure).",
        termination_raison_max_temps: "La session a expiré après avoir atteint la limite maximale de temps autorisée (4 heures).",
        termination_instructions: "Conformément à vos choix ou aux règles de l'étude, les données associées ont été traitées (supprimées ou sécurisées). Vous devez maintenant désinstaller l'extension de votre navigateur en suivant les étapes ci-dessous.",
        termination_raison_stopped_by_user: "Vous avez choisi d'arrêter manuellement l'expérience depuis l'extension. Conformément au protocole, les données de navigation récoltées lors de cette session vont être supprimées.",
        desinstaller_txt: "Désinstaller l'extension",

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

        tuto_titre: "Extension Installation",
        tuto_description: "To perform this research, you must install our temporary Chrome extension. It will transmit your browsing data only during the required steps of the study.",
        tuto_statut_attente: "Waiting for the extension to be installed...",
        tuto_statut_detecte: "Extension successfully detected!",
        tuto_statut_detecte_detail: "Please now click on the extension icon in your browser toolbar, then click on 'START THE STUDY'.",
        tuto_etape1_titre: "Download the extension",
        tuto_etape1_texte: "Click the button below to download the Chrome extension dedicated to our web navigation research project.",
        tuto_bouton_telecharger: "Add to Chrome (Placeholder)",
        tuto_etape2_titre: "Open the extensions list",
        tuto_etape2_texte: "Click on the puzzle piece icon in the top right corner",
        tuto_etape3_titre: "Open the extension",
        tuto_etape3_texte: "Click on the extension icon.",
        tuto_etape4_titre: "Start the study",
        tuto_etape4_texte: "Click on the extension icon and press the blue button to initiate data collection and continue the study.",
        tuto_statut_attente: "Waiting for the extension to be installed... (If you just installed it, please refresh this page)",
        
        // --- Consent ---
        consentement_titre: "Information and Consent Form",
        consentement_sous_titre:"Validation of General Knowledge Questions for the Study of Web Information-Seeking Processes",
        consentement_intro: "Please read the following information carefully before participating in the study.",
        consentement_checkbox: "I have read and understood the information above and wish to participate in the study. I confirm that I am 18 years of age or older.",
        btn_consentement_accepter: "I accept and wish to participate",
        btn_consentement_refuser: "I do not wish to participate",
        consentement_refuse_titre: "Thank You",
        consentement_refuse_texte: "We understand your decision. You may close this page.",
        consentement_texte: `
            <h3>Researcher Presentation</h3>
            <p>This research is conducted as part of a grant from the Natural Sciences and Engineering Research Council of Canada and is led by Alexandre Marois, Assistant Professor at the School of Psychology, Université Laval, and Director of the Laboratory for Interdisciplinary Studies on Human Limits and Augmentation (LEILAH).</p>
            
            <h3>Introduction</h3>
            <p>Before agreeing to participate in this study, please take the time to read and understand the information below. This document explains the purpose of the research, its procedures, benefits, and potential inconveniences. If you have any questions, please contact the laboratory by email at <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>
            
            <h3>Nature of the Study</h3>
            <p>The purpose of this research is to better understand how individuals interact with information technologies for information‑seeking purposes, specifically web‑based technologies.</p>
            
            <h3>Procedure</h3>
            <p>After reading this implicit consent form, you will be asked to complete a questionnaire outlining certain sociodemographic characteristics. You will then complete an information-seeking task using web technologies. You will be required to install and activate a browser extension developed by the research team, which allows the collection of web-navigation data when active.</p>
            <p>The extension collects the following information: websites visited, time spent and content viewed on each site, on-page interactions (e.g., navigation within pages), and keyboard activity (keystroke count, copied and pasted content). The extension functions only on Google Chrome and does not operate in private browsing mode. The use of artificial-intelligence tools (e.g., Gemini, ChatGPT, Copilot) is strictly prohibited and will invalidate your data.</p>
            
            <h3>Benefits and Disadvantages</h3>
            <p>A benefit of this study is your contribution to advancing knowledge about the use of information technologies to support human performance. This project will shed light on the different processes involved in information seeking. The study will also allow the validation and the elaboration of response norms for the different questions you will answer to.</p>
            <p>A potential inconvenience is moderate cognitive fatigue over approximately 60 minutes. The time spent on the project can also be seen as an inconvenience. You will have the possibility to take a break at any moment if the fatigue that you feel is too difficult, but you will be required to finish the study within one single period of time.</p>
            
            <h3>Compensation</h3>
            <p>A financial compensation of $30 will be provided for full participation, provided that the data remain valid and free from AI assistance. Compensation will be provided via Interac e-Transfer, pickup at Université Laval, or by mail, depending on your choice.</p>
            
            <h3>Voluntary Participation and Right to Withdraw</h3>
            <p>Your participation is voluntary. Submission of the completed questionnaire constitutes implicit consent. You may withdraw after submission without penalty while keeping your compensation. If you want to withdraw, please send an email to the research team at: <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. We will remove your data without any prejudice and you will not have to provide any explanation.</p>
            
            <h3>Confidentiality and Data Management</h3>
            <p>The data collected during this study are entirely confidential and will under no circumstances allow for your identification once the linkage key is destroyed in December 2027. Your confidentiality will be ensured through the assignment of a numerical code, which does not appear on the present form, to all collected research data. Web-navigation data will be anonymized and dissociated from your identity. Your contact information will be accessible only to members of the research team, all of whom have signed a confidentiality agreement. If sensitive data have been collected (e.g., user identifiers on information-seeking websites, URLs), please note that these data will be irreversibly destroyed in December 2028. Only individuals who have signed a confidentiality agreement will have access to these data, and they will not be associated with your identity.<p>
            <p>Anonymized and aggregated data will be kept by the research team for future use in an irreversibly coded format within an anonymous database, that is, following the destruction of all research materials that could identify participants (list of participants’ names and any identifying documents), until no later than December 2035. Research results, which may be disseminated in the form of scientific articles, research reports, conference presentations, and/or a doctoral dissertation, will not allow for the identification of participants.</p>
            
            <h3>Additional Information</h3>
            <p>For any questions, please contact the laboratory at <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>
            
            <h3>Complaints or Criticism</h3>
            <p>Complaints may be directed to the Office of the Ombudsman at Université Laval :</p>

            <p>
                Pavillon Alphonse-Desjardins, bureau 3320<br>
                2325, rue de l’Université<br>
                Université Laval<br>
                Québec (Québec) G1V 0A6<br>
                Renseignements - Secrétariat : 1 418 656-3081<br>
                Ligne sans frais : 1 866 323-2271<br>
                Courriel :
                <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a>
            </p>

            <p style="font-size:0.8em; color:#64748b; margin-top:20px; line-height:1.5;">
                This research project, entitled "Validation de questions de connaissances générales pour l'étude des processus de recherche
                d'information Web?”, conducted by Alexandre Marois, Professor at the School of Psychology at Université Laval, is funded by the Natural
                Sciences and Engineering Research Council of Canada (NSERC). This project has been approved by the Université Laval Research
                Ethics Committee: Approval No. 2025-460 A-1 / 04-05-2026.
            </p>
        
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
        demo_compensation: "How would you like to receive your compensation? (we will contact you after the study for details)",
        demo_pay_interac: "Interac e-Transfer",
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
        instr_item_4: "You have 10 minutes to answer each question. Your answer should ideally be <strong>between 75 and 100 words</strong> (a visual indicator will guide you, but you can submit your text even if it is shorter).",
        instr_item_5: "Data collection stops automatically after <strong>1 hour of inactivity</strong> or after a maximum of <strong>4 hours of activity</strong> (don't worry this is a safety measure, the study actually takes much less time than that!).",
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
            "I know how to download/save photos I found online.",
            "I know how to use keyboard shortcuts (e.g., CTRL-C for copy, CTRL-S for save).",
            "I know how to open a new tab on my browser.",
            "I know how to bookmark a website.",
            "I know where to click to go to a different webpage.",
            "I find it hard to decide what the best keywords are to use for online searches.",
            "I find it hard to find a website I visited before.",
            "I get tired when looking for information online.",
            "Sometimes I end up on websites without knowing how I got there.",
            "I find the way in which many websites are designed confusing.",
            "I should take a course on finding information online.",
            "Sometimes I find it hard to verify information I have retrieved.",
            "I know which information I should and shouldn’t share online",
            "I know when I should and shouldn’t share information online.",
            "I am careful to make my comments and behaviours appropriate to the situation I find myself in online.",
            "I know how to change who I share content with (e.g. friends, friends of friends or public).",
            "I know how to remove friends from my contact lists.",
            "I know how to create something new from existing online images, music or video.",
            "I know how to make basic changes to the content that others have produced.",
            "I know how to design a website.",
            "I know which different types of licences apply to online content.",
            "I would feel confident putting video content I have created online.",
            "I know how to install apps on a mobile device.",
            "I know how to download apps to my mobile device.",
            "I know how to keep track of the costs of mobile app use."
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
        debriefing_sous_titre: "Validation of General Knowledge Questions for the Study of Web Information-Seeking Processes",
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
            <p>Following the disclosure of the deception to which you were exposed, we are providing you with a post-experimental addendum to the Information and Consent Form that you signed prior to the beginning of the experiment. This document explains the elements that were concealed in the original form and reiterates information related to your consent. You are invited to contact the laboratory team should you have any questions you deem useful.</p>
            
            <h3>Nature of the Study</h3>
            <p>Initially, we indicated that the purpose of this research was to better understand how individuals interact with information technologies for information-seeking purposes, more specifically web-based technologies. The true objectives of the study are to better understand how web search strategies may affect the memorization of content encountered in an information-seeking context.</p>
            
            <h3>Voluntary Participation and Right to Withdraw</h3>
            <p>You are free to maintain or withdraw your consent following the disclosure of this information. You may terminate your participation without prejudice, retain your compensation, and without having to justify your decision. All personal information concerning you and your responses will then be destroyed. Please select the option that best reflects your decision following the disclosure of this deception.</p>
            
            <h3>Additional Information</h3>
            <p>For any questions, please contact the laboratory at <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>.</p>
            
            <h3>Complaints or Criticism</h3>
            <p>Any complaints or criticisms about this study may be addressed to the Office of the Ombudsman at Université Laval:</p>
            <p>Pavillon Alphonse-Desjardins, bureau 3320<br>
                2325, rue de l’Université<br>
                Université Laval<br>
                Québec (Québec) G1V 0A6<br>
                Renseignements - Secrétariat : 1 418 656-3081<br>
                Ligne sans frais : 1 866 323-2271<br>
                Courriel : <a href="mailto:info@ombudsman.ulaval.ca">info@ombudsman.ulaval.ca</a>
            </p>

            <p style="font-size:0.8em; color:#64748b; margin-top:20px; line-height:1.5;">This research project, entitled "Validation de questions de connaissances générales pour l'étude des processus de recherche
            d'information Web?”, conducted by Alexandre Marois, Professor at the School of Psychology at Université Laval, is funded by the Natural
            Sciences and Engineering Research Council of Canada (NSERC). This project has been approved by the Université Laval Research
            Ethics Committee: Approval No. 2025-460 A-1 / 04-05-2026.</p>
        `,

        // --- End Screen ---
        fin_titre: "Thank you for your participation!",
        fin_soustitre: "Your answers have been successfully recorded.",
        fin_texte: `
            <div style="margin-top:32px; padding:24px; background:#fef2f2; border:1px solid #fecaca; border-radius:12px; text-align:left;">
                <h3 style="margin:0 0 16px; font-size:18px; color:#dc2626;">Last crucial step: Uninstall the extension</h3>
                <p style="font-size:14px; color:#475569; margin-bottom:12px;">The study is now complete. You must remove the extension from your browser to complete the process.</p>
                
                <p style="font-size:13px; color:#b91c1c; font-weight:600; margin-bottom:24px; background:#fee2e2; padding:12px; border-radius:6px; border:1px dashed #fca5a5; line-height:1.5;">
                    If you encounter any problems uninstalling the extension, contact the team at the following email address: <a href="mailto:LEILAH@ulaval.ca">LEILAH@ulaval.ca</a>. But do not worry, even if it remains installed, the extension will no longer collect any data.
                </p>

                <!-- METHOD 1 (PRIMARY AND FAST) -->
                <div style="background:#fff; border:1px solid #cbd5e1; border-left:4px solid #ef4444; border-radius:8px; padding:16px; margin-bottom:20px;">
                    <h4 style="margin:0 0 12px 0; font-size:16px; color:#1e293b;">
                        ⚡ Method 1: Instant Uninstallation (Recommended)
                    </h4>
                    <p style="margin:0 0 14px 0; font-size:14px; color:#475569; line-height:1.5;">
                        <strong>Step 1:</strong> Click the red button below to trigger the uninstallation:
                        <br>
                        <button id="btnUninstallFromPage" style="margin-top:10px; padding:12px 24px; font-weight:bold; background-color:#ef4444; color:white; border:none; border-radius:6px; cursor:pointer; display:inline-block; font-family:inherit; font-size:14px;">🗑️ Uninstall the extension</button>
                    </p>
                    
                    <div style="border-top:1px solid #f1f5f9; padding-top:12px;">
                            <p style="margin:14px 0 10px 0; font-size:14px; color:#475569; line-height:1.5;">
                            <strong>Step 2:</strong> Confirm the deletion in the native dialog box that appears at the top of your screen by clicking <strong>"Remove"</strong>.
                            </p>
                            <img src="/images/en_uninstall_4.png" alt="Step D" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    </div>
                </div>

                <!-- METHOD 2 (ALTERNATIVE AND MANUAL) -->
                <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:16px; margin-bottom:10px;">
                    <h4 style="margin:0 0 12px 0; font-size:15px; color:#475569;">
                        🧩 Method 2: Manual Uninstallation (Alternative)
                    </h4>
                    <p style="font-size:13px; color:#64748b; margin-top:-8px; margin-bottom:16px;">
                        <em>Only use this method if the red button above does not respond.</em>
                    </p>

                    <div style="display:flex; flex-direction:column; gap:16px;">
                        <div style="border-top:1px solid #f1f5f9; padding-top:12px;">
                            <p style="margin:0 0 8px 0; font-size:13px; color:#334155;"><strong>Step A:</strong> Click on the extensions icon (puzzle piece menu) in the top-right corner.</p>
                            <img src="/images/en_uninstall_1.png" alt="Step A" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        </div>
                        <div style="border-top:1px solid #f1f5f9; padding-top:12px;">
                            <p style="margin:0 0 8px 0; font-size:13px; color:#334155;"><strong>Step B:</strong> Click on the 3 dots button next to the study extension.</p>
                            <img src="/images/en_uninstall_2.png" alt="Step B" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        </div>
                        <div style="border-top:1px solid #f1f5f9; padding-top:12px;">
                            <p style="margin:0 0 8px 0; font-size:13px; color:#334155;"><strong>Step C:</strong> Click now on the "Remove from Chrome" button.</p>
                            <img src="/images/en_uninstall_3.png" alt="Step C" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        </div>
                        <div style="border-top:1px solid #f1f5f9; padding-top:12px;">
                            <p style="margin:0 0 8px 0; font-size:13px; color:#334155;"><strong>Step D:</strong> A small window will appear at the top of the screen. Click on the "Remove" button to confirm.</p>
                            <img src="/images/en_uninstall_4.png" alt="Step D" style="max-width:100%; border:1px solid #cbd5e1; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                        </div>
                    </div>
                </div>
            </div>
        `,
        termination_titre: "Study Terminated",
        termination_raison_consent_refuse: "You declined the initial consent form.",
        termination_raison_deception_refuse: "You chose to withdraw your participation following the debriefing.",
        termination_raison_inactivite: "The session expired due to prolonged inactivity (1 hour).",
        termination_raison_max_temps: "The session expired after reaching the maximum 4-hour time limit.",
        termination_instructions: "In accordance with your choices or study guidelines, the corresponding data has been handled (deleted or secured). Please proceed to uninstall the extension from your browser by following the steps below.",
        termination_raison_stopped_by_user: "You chose to manually stop the experience from the extension. In accordance with the protocol, navigation data collected during this session will be deleted.",
        desinstaller_txt: "Uninstall the extension",
        
        // --- Security and Time limits ---
        limite_inactivite: "Data collection stopped due to 1 hour of inactivity.",
        limite_max_temps: "Data collection stopped because the maximum allowed duration of 4 hours has elapsed.",
        limite_donnees_invalides: "Your data has been invalidated.",
        limite_etude_annulee: "Study Cancelled"
    }
};