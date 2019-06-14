using FinalFantasyXIVSquadBuilder.Lib.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using System.Data.SQLite;
using System.Linq;

namespace FinalFantasyXIVSquadBuilder.Lib.Data
{
    public static class Queries
    {
        private static readonly string constr = @"Data Source=./ffxivsb.db";
        public static async Task<List<SquadMember>> GetBaseSquadValues()
        {
            using (var con = new SQLiteConnection(constr))
            {
                await con.OpenAsync();
                return (await con.QueryAsync<SquadMember>(
                    "SELECT * FROM squad ORDER BY ID")).ToList();
            }
        }

        public static async Task<List<StatRecord>> GetAttributeValues()
        {
            using (var con = new SQLiteConnection(constr))
            {
                await con.OpenAsync();
                return (await con.QueryAsync<StatRecord>(
                    "SELECT AttributeType AS [Name], Physical, Mental, Tactical FROM AttributeValues")).ToList();
            }
        }

        public static async Task<List<string>> GetTables()
        {
            using (var con = new SQLiteConnection(constr))
            {
                await con.OpenAsync();
                return (await con
                    .QueryAsync<string>("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"))
                    .ToList();
            }
        }

        public static async Task<List<int[]>> GetSquadCombos()
        {
            using (var con = new SQLiteConnection(constr))
            {
                await con.OpenAsync();
                return (await con
                    .QueryAsync<(int m1, int m2, int m3, int m4)>("SELECT Member1, Member2, Member3, Member4 FROM SquadGroups"))
                    .Select(x => new int[] { x.m1, x.m2, x.m3, x.m4 })
                    .ToList();
            }
        }

        public static async Task<List<(string TraningType, int[] Params)>> GetTrainingParams()
        {
            using (var con = new SQLiteConnection(constr))
            {
                await con.OpenAsync();
                return (await con
                    .QueryAsync<(string training, int m1, int m2, int m3, int m4)>("SELECT Name, Physical, Mental, Tactical FROM Training"))
                    .Select(x => (x.training, new int[] { x.m1, x.m2, x.m3, x.m4 }))
                    .ToList();
            }
        }
    }
}
