using FinalFantasyXIVSquadBuilder.Lib.Data;
using FinalFantasyXIVSquadBuilder.Lib.Interfaces;
using FinalFantasyXIVSquadBuilder.Lib.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinalFantasyXIVSquadBuilder.Lib.Logic
{
    public static class SquadCalculator
    {
        private static List<SquadMember> SquadMembers;

        private static ICalcResult GetErrorResult(string error)
        {
            return new ErrorResult(error);
        }

        private static bool InsufficientSquadSize(List<SquadMember> members) => members.Count < 4;
        private static bool HasMissingAttributes(List<StatRecord> attributes) =>
            attributes.Where(x => x.Physical == 0 || x.Mental == 0 || x.Tactical == 0).Any();
        private static List<SquadMember> GetActiveSquad(List<SquadMember> members, int[] combo) =>
            members.Where(x => combo.Contains(members.IndexOf(x) + 1)).ToList();
        private static bool SquadPassed(int physical, int mental, int tactical, StatRecord test) =>
            physical >= test.Physical && mental >= test.Mental && tactical >= test.Tactical;
        private static (StatRecord Required, StatRecord SquadBase) GetAttributeParams(List<StatRecord> attributes) =>
            (attributes.FirstOrDefault(x => x.Name == "Mission"), attributes.FirstOrDefault(x => x.Name == "Squadron"));
        private static int SquadIndex(SquadMember member) =>
            SquadMembers.IndexOf(member);

        public static async Task<ICalcResult> PickSquad(CalcPayload payload)
        {
            var recTraining = "";
            List<SquadMember> mainSquad = null;
            int calcPhysical = 0, calcMental = 0, calcTactical = 0;

            SquadMembers = payload.Members;
            var combos = await Queries.GetSquadCombos();
            var training = await Queries.GetTrainingParams();

            if (InsufficientSquadSize(payload.Members))
            {
                return GetErrorResult("You need at least 4 squad members.");
            }
            else
            {
                if (HasMissingAttributes(payload.Attributes))
                {
                    return GetErrorResult("All Physical, Mental, and Tactical fields are required.");
                }
                int comboIndex = -1, trainingIndex = -1;

                // get squad and mission (required) attributes
                var prms = GetAttributeParams(payload.Attributes);
                var squadBasePhysical = prms.SquadBase.Physical;
                var squadBaseMental = prms.SquadBase.Mental;
                var squadBaseTactical = prms.SquadBase.Tactical;

                // if a squad combo isn't found then comboIndex will remain -1
                // otherwise it will have the index of the needed combo
                for (var cnt = 0; cnt < combos.Count; cnt++)
                {
                    trainingIndex = -1;
                    // build a squad to test against the requirements
                    mainSquad = GetActiveSquad(payload.Members, combos[cnt]);

                    // get contributed attribute totals for the squad
                    var rlt = GetActiveSquadAttributes(mainSquad);

                    // test the squad using all of the training methods to see if any succeed vs requirements
                    foreach (var t in training)
                    {
                        trainingIndex++;
                        if (SquadPassed(
                            (squadBasePhysical + rlt.Physical + t.Params[0]),
                            (squadBaseMental + rlt.Mental + t.Params[1]),
                            (squadBaseTactical + rlt.Tactical + t.Params[2]),
                            prms.Required))
                        {
                            comboIndex = cnt;
                            break;
                        }
                    }
                    if (comboIndex > -1) { break; }
                }

                if (comboIndex == -1)
                {
                    return GetErrorResult("Consider leveling your current recruits.");
                }

                // calculate the succeeding squads attribute totals including base, contributed, and training values
                recTraining = training[trainingIndex].TraningType;
                (calcPhysical, calcMental, calcTactical) = GetCalculatedAttributes(
                    SquadMembers, 
                    combos[comboIndex], 
                    new StatRecord() { Physical = squadBasePhysical, Mental = squadBaseMental, Tactical = squadBaseTactical },
                    new StatRecord() { Physical = training[trainingIndex].Params[0], Mental = training[trainingIndex].Params[1], Tactical = training[trainingIndex].Params[2] });
            }

            return new CalcResult(                
                SquadIndex(mainSquad[0]),
                SquadIndex(mainSquad[1]),
                SquadIndex(mainSquad[2]),
                SquadIndex(mainSquad[3]), 
                recTraining, 
                new StatRecord()
                {
                    Name = "Totals",
                    Physical = calcPhysical,
                    Mental = calcMental,
                    Tactical = calcTactical
                });
        }

        private static (int calcPhysical, int calcMental, int calcTactical) GetCalculatedAttributes(List<SquadMember> SquadMembers, int[] combo, StatRecord baseAttributes, StatRecord trainingAttributes)
        {
            var summary = GetSquadSummary(SquadMembers, combo);
            var p = (baseAttributes.Physical + summary.Physical + trainingAttributes.Physical);
            var m = (baseAttributes.Mental + summary.Mental + trainingAttributes.Mental);
            var t = (baseAttributes.Tactical + summary.Tactical + trainingAttributes.Tactical);
            return (p,m,t);
        }

        private static (int Physical, int Mental, int Tactical) GetSquadSummary(List<SquadMember> SquadMembers, int[] combo)
        {
            int physical = 0, mental = 0, tactical = 0;
            for (var i = 0; i < combo.Length; i++)
            {
                physical += SquadMembers[combo[i] - 1].Physical;
                mental += SquadMembers[combo[i] - 1].Mental;
                tactical += SquadMembers[combo[i] - 1].Tactical;
            }
            return (physical, mental, tactical);
        }

        private static (int Physical, int Mental, int Tactical) GetActiveSquadAttributes(List<SquadMember> mainSquad)
        {
            int physical = 0, mental = 0, tactical = 0;
            foreach (var itm in mainSquad)
            {
                physical += itm.Physical;
                mental += itm.Mental;
                tactical += itm.Tactical;
            }
            return (physical, mental, tactical);
        }
    }
}
