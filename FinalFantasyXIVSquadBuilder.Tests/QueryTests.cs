using FinalFantasyXIVSquadBuilder.Lib.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace FinalFantasyXIVSquadBuilder.Tests
{
    public class QueryTests
    {
        [Fact]
        public async Task GetBaseSquadValuesTest()
        {
            // expected
            var expected = 8;

            // actual
            var actual = await Queries.GetBaseSquadValues();

            // assert
            Assert.Equal(expected, actual.Count);
        }
    }
}
