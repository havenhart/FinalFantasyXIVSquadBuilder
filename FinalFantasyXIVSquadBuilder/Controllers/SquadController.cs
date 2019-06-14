using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using FinalFantasyXIVSquadBuilder.Lib.Data;
using FinalFantasyXIVSquadBuilder.Lib.Logic;
using FinalFantasyXIVSquadBuilder.Lib.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft;
using Newtonsoft.Json.Linq;

namespace FinalFantasyXIVSquadBuilder.WebUI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SquadController : ControllerBase
    {
        [HttpGet]
        [Route("Roster")]
        public async Task<JsonResult> GetSquadRoster()
        {
            return new JsonResult(await Queries.GetBaseSquadValues());
        }

        [HttpGet]
        [Route("Attributes")]
        public async Task<JsonResult> GetSquadAttributes()
        {
            return new JsonResult(await Queries.GetAttributeValues());
        }

        [HttpPost]
        [Route("Calculate")]
        public async Task<IActionResult> Calculate([FromBody]CalcPayload payload)
        {
            return Ok(await SquadCalculator.PickSquad(payload));
        }
    }
}